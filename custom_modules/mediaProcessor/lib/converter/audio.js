var ffmpeg = require('fluent-ffmpeg');


exports.toMp3 = function (source, destination, callback) {

    var proc1 = new ffmpeg({ source: source })
        .withAudioCodec('libmp3lame')
        .withAudioChannels(2)
        .withAudioBitrate('256k')
        .toFormat('mp3')
        .saveToFile(destination, function (stdout, stderr) {
            console.log('file has been converted succesfully', stderr, stdout);
            var files = {
                stream: { original: source,
                    mp3: destination }
            };
            log.trace(files);
            callback(files);
        });
};


