var ffmpeg = require('fluent-ffmpeg');
var async = require("async");
var gm = require('gm').subClass({ imageMagick: true });
var utils = require('../../../../src/Utils');
var mediaStorageConfig = _config.mediaStorage;


exports.toImageFormats = function (source, text, callback) {
    var tasks = [];
    tasks.push(function (callback) {
        var pathToAnnotatedFile = mediaStorageConfig.storageBaseDir + utils.parseFilePath(source).fileNameWithoutExtension + (+new Date())  + '.png';
        gm(source)
            .stroke("#ffffff")
            .font("Helvetica.ttf", 35)
            .drawText(20, 20, text)
            .write(pathToAnnotatedFile, function (err) {
                if (!err) {
                    log.info('Annotated File with Watermark created!');
                    callback(null, ['image', 'png', pathToAnnotatedFile]);
                }
                else
                    log.error(err);
            });
    });

    async.series(tasks, function (err, fileDetails) {
        var files = {
            image: {},
            stillAnnotatedImage: {}
        };
        fileDetails.forEach(function (fileDetail, idx) {
            log.trace("fileDetails", fileDetails);
            files[fileDetail[0]][fileDetail[1]] = fileDetail[2];
            if (idx == fileDetails.length - 1) {
                files[fileDetail[0]]['original'] = source;
            }
        });
        console.log(fileDetails[0][2], fileDetails);
        files['stillAnnotatedImage']['png'] = fileDetails[0][2];
        callback(files);
    });
};