var ffmpeg = require('fluent-ffmpeg');
var async = require("async");
var gm = require('gm');
var shell = require("shelljs");


exports.toVideoFormats = function (source, destination, time, text, callback) {
    console.log(source, destination);
    var tasks = [];

    tasks.push(function (callback) {
        convertToMP2(source, destination, callback)
    });
    tasks.push(function (callback) {
        convertToMP4LowRes(source, destination, text, callback)
    });
    tasks.push(function (callback) {
        convertToMP4HiRes(source, destination, callback)
    });
    tasks.push(function (callback) {
        var timeArray = time.split("-");
        var timeInSeconds = timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2];
        getStillImageFromVideo(source, timeInSeconds, function (files) {
            var pathToAnnotatedFile = _config.mediaStorage.storageBaseDir + files[0].replace('jpg', 'png');
            gm(_config.mediaStorage.storageBaseDir + '/' + files[0])
                .stroke("#ffffff")
                .font("Helvetica.ttf", 35)
                .drawText(900, 505, text)
                .write(pathToAnnotatedFile, function (err) {
                    if (!err) {
                        log.info('Annotated File with Watermark created!');
                        callback(null, ['stillAnnotatedImage', 'png', pathToAnnotatedFile]);
                    }
                });
        });
    });
    tasks.push(function (callback) {
        var timeArray = time.split("-");
        var timeInSeconds = timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2];
        getStillImageFromVideo(source, timeInSeconds, function (files) {
            var pathToAnnotatedFileWithoutWaterMark = _config.mediaStorage.storageBaseDir + 'WithoutWaterMark' + files[0].replace('jpg', 'png');
            gm(_config.mediaStorage.storageBaseDir + '/' + files[0])
                .stroke("#ffffff")
                .write(pathToAnnotatedFileWithoutWaterMark, function (err) {
                    if (!err) {
                        log.info('Annotated File without Watermark created!');
                        callback(null, ['stillAnnotatedImageWithoutWatermark', 'png', pathToAnnotatedFileWithoutWaterMark]);
                    }
                });
        });
    });

    async.parallel(tasks, function (err, fileDetails) {
        console.log("All parallel tasks executed: ", err, fileDetails);
        if (!err) {
            var files = {
                stream: {},
                stillAnnotatedImage: {},
                stillAnnotatedImageWithoutWatermark: {}
            };
            fileDetails.forEach(function (fileDetail, idx) {
                console.log("fileDetails", fileDetails);
                files[fileDetail[0]][fileDetail[1]] = fileDetail[2];
                if (idx == fileDetails.length - 2) {
                    files[fileDetail[0]]['original'] = source;
                }
            });
            callback(files);

        } else {
            callback(null);
        }
    });
};


function convertToMP2(source, destination, callback) {
    destination = destination + ".mp2";
    console.log(destination);
    shell.exec([
        "ffmpeg -i",
        source,
        "-f mp2 -b:v 1200k -vcodec mpeg2video -b:a 128k -ac 2 -acodec libmp3lame -threads 0 -y",
        destination
    ].join(" ").printAndReturnSelf(), function (status, output) {
        console.log("File has been converted to MP2 successfully", status, output);
        callback(null, ["stream", 'mp2', destination]);
    });
}

function convertToMP4LowRes(source, destination, text, callback) {
    destination = destination + "_lowRes.mp4";
    console.log(destination, text);
    var fontPath = __appBaseDir + '/web-app/fonts/';
    shell.exec([
        "ffmpeg -y -i",
        source,
        "-f mp4 -map 0:v -map 0:a -b:a 128k -ac 2 -strict experimental -codec:a aac -ar 48000 -vcodec libx264 -profile:v baseline -crf 23 -x264opts keyint=30:qpmin=20:vbv-maxrate=1350:vbv-bufsize=1350 -vf \"scale=trunc((sar*oh*a)/2)*2:480\" -vf drawtext=fontfile=" + fontPath + "vollkorn-regular-webfont.ttf:text=" + text.replace(/ /, "_") + ":fontcolor=black@1.0:fontsize=15:x=05:y=10 -vsync 2 -r 30000/1001 -threads 0 -movflags faststart",
        destination
    ].join(" ").printAndReturnSelf(), function (status, output) {
        console.log('File has been converted to MP4 Low resolution successfully', status, output);
        callback(null, ["stream", 'lowMp4', destination]);
    });
}

function convertToMP4HiRes(source, destination, callback) {
    destination = destination + "_hiRes.mp4";
    shell.exec([
        "ffmpeg -i",
        source,
        "-f mp4 -b:v 1200k -vcodec libx264 -b:a 128k -ac 2 -acodec libvo_aacenc -ar 48000 -s 1920x1080 -threads 0 -y",
        destination
    ].join(" ").printAndReturnSelf(), function (status, output) {
        console.log('File has been converted to MP4 High resolution successfully', status, output);
        callback(null, ["stream", 'mp4', destination]);
    });
}


function getStillImageFromVideo(source, time, callback) {
    new ffmpeg({ source: source })
        .withSize('1920x1080')
        .on('error', function (err) {
            console.log('An error occurred: ' + err.message);
        })
        .on('end', function (filenames) {
            console.log('Successfully generated ' + filenames.join(', '));
            callback(filenames);
        })
        .takeScreenshots(
        {
            count: 1,
            timemarks: [time],
            filename: '%b-thumbnail-%i-%r'
        },
        _config.mediaStorage.storageBaseDir
    );
}