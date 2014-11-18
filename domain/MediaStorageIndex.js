exports.schema = {
    filePath: {
        download: {},
        stream: {},
        image: {}
    },
    isLocalPath: Boolean,
    access: {
    },
    source: {
    },
    metaData: {
    },
    stillAnnotatedImage: {},
    stillAnnotatedImageWithoutWatermark:{}
};


exports.static = {
    findByMediaId: function (id, callback) {
        this.findOne({_id: id}, function (err, obj) {
            if (err) callback(null);
            else callback(obj);
        });
    }
};