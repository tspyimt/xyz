var fs = require("fs");
var mediaStorageConfig = _config.mediaStorage;
var ffmpeg = require("fluent-ffmpeg");
var async = require("async");

exports.persist = function (name, buffer, category, callback) {
    log.trace(name);
    var pathOriginal = (mediaStorageConfig.storageBaseDir + (+new Date()) + name).trim().replace(/ +/g, "_");
    var tasks = [];
    //Save in original format
    tasks.push(function (callback) {
        writeFile(pathOriginal, buffer, function (err) {
            if (err) {
                log.error(err);
                callback("Unable to save 'original' file.");
            } else {
                if (category == 'Still Image')
                    callback(null, ["image", "original", pathOriginal]);
                else
                    callback(null, ["stream", "original", pathOriginal]);
            }
        });
    });

    async.series(tasks, function (err, fileDetails) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            var files = {
                'image' :{},
                'stream' : {}
            };
            fileDetails.forEach(function (fileDetail) {
                console.log(fileDetail);
                files[fileDetail[0]][fileDetail[1]] = fileDetail[2];
            });
            callback(null, files)
        }
    });
};


function writeFile(destinationPath, buffer, callback) {
    fs.open(destinationPath, "w", function (error, fd) {
        if (error) {
            console.log(error);
            callback(error);
        } else {
            fs.write(fd, buffer, 0, buffer.length, 0, function (error, written, buffer) {
                if (error) {
                    console.log(error);
                    callback(error);
                    return;
                }
                callback();
                fs.close(fd);
            });
        }
    });
}

function encryptBuffer(buffer) {
    var cipher = crypto.createCipher(encryptionConfig.cipherAlgo, encryptionConfig.cipherPassword);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

function fileToBuffer(filePath, callback) {
    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.stat(filePath, function (error, stats) {
                if (error) {
                    console.log(error);
                    callback("Unable to stat the file " + filePath);
                    return;
                }
                fs.open(filePath, "r", function (error, fd) {
                    if (error) {
                        console.log(err);
                        callback("Unable to open file " + filePath);
                        return;
                    }
                    var buffer = new Buffer(stats.size);
                    fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                        if (error) {
                            console.log(err);
                            callback("Unable to read file " + filePath);
                            return;
                        }
                        callback(null, buffer);
                        fs.close(fd);
                    });
                });
            });
        } else {
            callback("File does not exist " + filePath);
        }
    });
}