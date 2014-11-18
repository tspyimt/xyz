/**
 * Created by intelligrape on 31/7/14.
 */
var fs = require('fs');
var request = require('request');
var EJS = require("ejs");

//Import Enums
var EventName = require("../src/enum/EventName");
exports.sendSubscribeMail = function (data) {
    log.info(data);
    var emitter = this;
    try {
        var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/subscribeMail.ejs', "utf8");
        var html = EJS.render(file, { 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl });
        globalEvent.emit("OnEmailNotification", {
            "emailId": data.email,
            "subject": 'ArtLock : Account Subscribing Notification',
            "textMatter": html
        });

        file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/subscribeMailToOwners.ejs', "utf8");
        html = EJS.render(file, {
            logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
            homeURL: _config.serverUrl,
            email: data.email
        });
        globalEvent.emit("OnEmailNotification", {
            "emailId": _config.email.copyTo && _config.email.copyTo.ON_USER_CREATED || [],
            "subject": 'ArtLock : Account Subscribing Notification',
            "textMatter": html
        });
        emitter.emit(EventName.DONE, "Mail successfully sent to destination");
    } catch (err) {
        log.error(err);
        emitter.emit(EventName.ERROR, err);
    }

}.toEmitter();

exports.sendContactMail = function (data) {
    log.info(data);
    var emitter = this;
    try {
        var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/contactMail.ejs', "utf8");
        var html = EJS.render(file, { name: data.name, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl, data: data });
        globalEvent.emit("OnEmailNotification", {
            "emailId": data.email,
            "subject": 'ArtLock : Application form Notification',
            "textMatter": html
        });

        file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/contactMailToOwners.ejs', "utf8");
        html = EJS.render(file, { name: data.name, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl, data: data });
        globalEvent.emit("OnEmailNotification", {
            "emailId": _config.email.copyTo && _config.email.copyTo.ON_USER_CREATED || [],
            "subject": 'ArtLock : Application form Notification',
            "textMatter": html
        });
        emitter.emit(EventName.DONE, "Mail successfully sent to destination");
    } catch (err) {
        log.error(err);
        emitter.emit(EventName.ERROR, err);
    }

}.toEmitter();