"use strict";

//Import Enums
var EventName = require("../src/enum/EventName");
var Role = require("../src/enum/Role");

exports.checkValidPrivateKey = function (key) {
    var emitter = this;
    var hashKey = AuthService.generateHash(key);
    User.findOne({hashPrivateKey: hashKey }, function (err, user) {
        console.log(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND, []);
    });
}.toEmitter();

exports.checkValidTradeKey = function (key) {
    var emitter = this;
    var hashKey = AuthService.generateHash(key);
    User.findOne({hashTradeKey: hashKey }, function (err, user) {
        if (err) emitter.emit(EventName.ERROR, err);
        if (user) emitter.emit(EventName.DONE, user);
        else emitter.emit(EventName.NOT_FOUND, []);
    });
}.toEmitter();

exports.checkValidCreatorKey = function (key) {
    var emitter = this;
    var hashKey = AuthService.generateHash(key);
    console.log(hashKey);
    User.findOne({hashCreatorKey: hashKey }, function (err, user) {
        console.log(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND, []);
    });
}.toEmitter();

exports.checkValidKeyByUserRole = function (user, key) {
    var emitter = this;
    var criteria = {'privateKey': key};
    console.log(user);
    (user.roles).forEach(function (element, indx) {
        if (element == Role.COLLECTOR) {
            criteria = {'creatorKey': key};
        }
    });
    User.find(criteria, function (err, user) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        if (user.length)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND, []);
    });
}.toEmitter();
