var EventName = require('../src/enum/EventName');
var Utils = require("../src/Utils");
var ObjectId = require('mongoose').Types.ObjectId;
var async = require('async');
var fs = require('fs');

exports.getUser = function (user) {
    var emitter = this;
    User.findOne({_id: user._id}, {password: 0}, function (err, user) {
        log.info(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();


exports.getUserByEmail = function (userEmail) {
    var emitter = this;
    User.findOne({'email.primary': userEmail}, {password: 0}, function (err, user) {
        log.info(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND, {});
    });
}.toEmitter();

exports.updateUser = function (user, data) {
    var emitter = this;
    console.log(data);
    User.findOneAndUpdate({_id: ObjectId(user._id + "")}, {$set: data}, {select: {password: 0}, new: true}, function (err, user) {
        if (err) {
            log.info(err);
            emitter.emit(EventName.ERROR);
        } else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();

exports.getUserEmailId = function (userId) {
    var emitter = this;
    var userIdObj = Utils.convertToObjectId(userId);
    User.findOne({_id: userIdObj}, {'email.primary': 1}, function (err, user) {
        log.info(user.email.primary);
        console.log(user.email.primary);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, user.email.primary);
        else
            emitter.emit(EventName.NOT_FOUND, {});
    });
}.toEmitter();


// Upload avatar Service
exports.uploadingAvtService = function (AvtPath, AvtFileName, userid) {
    var AvtFileURL = __appBaseDir + '/userAvt/' + AvtFileName;
    var emitter = this;

    function uploadingFile(cb) {
        fs.exists(AvtPath, function (exist) {
            if (exist) {
                fs.stat(AvtPath, function (err, stats) {
                    fs.open(AvtPath, 'r', null, function (err, fd) {
                        var buffer = new Buffer(stats.size);
                        fs.read(fd, buffer, 0, stats.size, null, function (err, byteRead, buffer) {
                            fs.writeFile(__appBaseDir + '/userAvt/' + AvtFileName, buffer, function () {
                                User.findOne({ '_id': userid }, function (err, doc) {
                                    doc.avatar = AvtFileName;
                                    doc.save();
                                });
                                log.info('Uploaded avartar successfully!!');
                            });
                        });
                    });
                });
                cb(null);
            }
            else {
                cb("fileNotfound");
            }
        });
    }

    function updatingAvt(cb) {
        User.update({_id: userid}, {$set: {avatar: AvtFileName}}, function (err, data) {
            if (err) {
                log.error(err);
                cb(err);
            }
            else
                cb(null);
        });
    }

    async.series([uploadingFile, updatingAvt], function (err, res) {
        if (err)
            emitter.emit("error", err);
        else
            emitter.emit("success");
    })

}.toEmitter();