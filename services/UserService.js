var EventName = require('../src/enum/EventName');
var Utils = require("../src/Utils");
var ObjectId = require('mongoose').Types.ObjectId;

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