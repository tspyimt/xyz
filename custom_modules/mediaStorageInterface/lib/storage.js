var fs = require("fs");
var utils = require("../../../src/Utils");

exports.storeMediaContent = function (buffer, metadata, name, category, callback) {
    process.nextTick(function () {
        require("./persistor").persist(name, buffer,category, function (err, files) {
            if (err) {
                log.error(err);
                callback(err);
            } else {
                var indexEntry = new MediaStorageIndex({
                    filePath: files,
                    isLocalPath: true,
                    source: {
                        medium: "Buffer"
                    },
                    metaData: metadata
                });
                indexEntry.save(function (err, obj) {
                    if (err) callback("Unable To Save Media in Index");
                    else {
                        callback(null, obj);
                    }
                });
            }
        });
    });
};


exports.getOriginalMediaFileBuffer = function (id, quality, callback) {
    MediaStorageIndex.findByMediaId(id, function (mediaIndex) {
        if (mediaIndex) {
            var fileName = mediaIndex.filePath.stream[quality];
            fs.exists(fileName, function (exists) {
                if (exists) {
                    fs.stat(fileName, function (error, stats) {
                        if (error) {
                            callback(null);
                            return;
                        }
                        fs.open(fileName, "r", function (error, fd) {
                            if (error) {
                                callback(null);
                                return;
                            }
                            var buffer = new Buffer(stats.size);
                            fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                                if (error) {
                                    callback(null);
                                    return;
                                }
                                var name = fileName.replace(/(.*)\/([^\/]+$)/, function () {
                                    return arguments[2];
                                });
                                callback(buffer, name, utils.resolveContentTypeByExtension(name));
                                fs.close(fd);
                            });
                        });
                    });
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    })
};

exports.getOriginalMediaFileLocalPath = function (id, quality, callback) {
    console.log(id, quality);
    MediaStorageIndex.findByMediaId(id, function (mediaIndex) {
        if (mediaIndex) {
            var fileName = mediaIndex.filePath.stream[quality];
            callback(fileName);
        } else {
            callback(null);
        }
    })
};

exports.getEncryptedMediaFileBuffer = function (id, quality, callback) {
  MediaStorageIndex.findByMediaId(id, function (mediaIndex) {
        if (mediaIndex) {
            var fileName = mediaIndex.filePath.download[quality];
            fs.exists(fileName, function (exists) {
                if (exists) {
                    fs.stat(fileName, function (error, stats) {
                        if (error) {
                            callback(null);
                            return;
                        }
                        fs.open(fileName, "r", function (error, fd) {
                            if (error) {
                                callback(null);
                                return;
                            }
                            var buffer = new Buffer(stats.size);
                            fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
                                if (error) {
                                    callback(null);
                                    return;
                                }
                                var name = fileName.replace(/(.*)\/([^\/]+$)/, function () {
                                    return arguments[2];
                                });
                                callback(buffer, name, utils.resolveContentTypeByExtension(name));
                                fs.close(fd);
                            });
                        });
                    });
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    })
};
