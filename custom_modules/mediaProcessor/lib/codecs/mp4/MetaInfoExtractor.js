var mm = require('musicmetadata');
var BufferReadStream = require('bufferUtils').BufferReadStream;

exports.extractMetaInfo = function (buffer, callback) {
    var brs = new BufferReadStream(buffer);
    var parser = new mm(brs);
    parser.on("metadata", function (comments) {
        callback(comments);
    });
    brs.resume();
};