var Metadata = require('fluent-ffmpeg').Metadata;
var audioConverter = require('./converter/audio');
var videoConverter = require('./converter/video');
var imageConverter = require('./converter/image');
var probe = require('node-ffprobe');
var mediaStorageConfig = _config.mediaStorage;


//Extract Metadata info the media

exports.getMetaData = function (filePath, callback) {
    new Metadata(filePath, function (metadata, err) {
        delete metadata['ffmpegOut'];
        delete metadata['ffmpegErr'];
        delete metadata['spawnErr'];
        log.trace(metadata);
        if (err) callback(null);
        else callback(metadata);
    });
};


exports.convertMedia = function (filePath, mediaType, fileData, time, text, callback) {
    var destination = (mediaStorageConfig.storageBaseDir + (+new Date()) + "_" + fileData.metaData.title).trim().replace(/ +/g, "_");
    log.trace(destination);

    switch (mediaType) {
        case 'Sound Art':
            log.info('Sound Art Conversion has started....');
            audioConverter.toMp3(filePath.stream.original, destination + ".mp3", function (files) {
                callback(files);
            });
            break;
        case 'Moving Image':
            log.info('Moving Image Conversion has started....');
            videoConverter.toVideoFormats(filePath.stream.original, destination, time, text, function (files) {
                log.trace(files);
                callback(files);
            });
            break;
        case 'Still Image':
            log.info('Still Image Conversion has started....');
            imageConverter.toImageFormats(filePath.image.original, text, function (files) {
                log.trace(files);
                callback(files);
            });
            break;
        default :
            callback('Media Type not found');
    }
};