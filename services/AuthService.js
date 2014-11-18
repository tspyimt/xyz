"use strict";

//Import Enums
var EventName = require("../src/enum/EventName");
var UserStatus = require("../src/enum/UserStatus");
var Utils = require("../src/Utils");
var jwt = require('jwt-simple');
var PDF = require('pdfkit');
var crypto = require('crypto');
var fs = require('fs');
var EJS = require("ejs");


/*
 * Authenticate a user login by a findOne query in database
 * */

exports.authenticate = function (params) {
    log.info(params);
    var emitter = this;
    User.findOne({"email.primary": params.email, "password": params.password, "virtual": false, "blocked": false}, {password: 0}, function (err, user) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else if (user) {
            emitter.emit(EventName.DONE, user);
            User.update({"email.primary": params.email}, {'$set': {'lastLogin': +new Date()}}, noop);
        } else {
            emitter.emit(EventName.NOT_FOUND, "Invalid Credentials");
        }
    });
}.toEmitter();

exports.emailVerification = function (params) {
    log.info(params);
    var emitter = this;
    User.findOne({"_id": params._id}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND);
    })
}.toEmitter();

exports.changePassword = function (params) {
    log.info(params);
    var emitter = this;
    User.findOne({"email.primary": params.email}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        else if (user) {
            AuthService.passwordToken(user._id, +new Date())
                .on(EventName.DONE, function (token) {
                    var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/resetPasswordMail.ejs', "utf8");
                    var html = EJS.render(file, {"link": _config.serverUrl + "/auth/resetPassword/" + token, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl});
                    globalEvent.emit("OnEmailNotification", {"emailId": user.email.primary, "subject": 'Change your account  password of ArtLock', "textMatter": html});

                    emitter.emit(EventName.DONE, user);
                })
        }
        else
            emitter.emit(EventName.NOT_FOUND, "EMAIL DOES NOT EXIST");
    })
}.toEmitter();

exports.changePasswordClick = function (params) {
    log.info(params);
    var emitter = this;
    User.findOneAndUpdate({"_id": params._id}, {password: params.password}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        else if (user) {
            emitter.emit(EventName.DONE, user);
        }
        else
            emitter.emit(EventName.NOT_FOUND, "User Not Found");
    })
}.toEmitter();

exports.emailVerified = function (data) {
    log.info(data);
    var emitter = this;

    User.findOne({"_id": data._id }, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();


exports.signIn = function (params) {
    log.info(params);
    var emitter = this;
    var user = {};
    emitter.emit(EventName.DONE, user);
}.toEmitter();


exports.signUpClick = function (params) {
    log.info(params);
    var emitter = this;
    console.log("ENTERING>>>>>>>>>>>>>>>>");
    User.findOne({"email.primary": params.email}, {password: 0}, function (err, user) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else if (!user) {
            new User({
                email: {primary: params.email},
                firstName: null,
                lastName: null,
                password: params.password,
                country: null,
                zip: null,
                roles: [require("../src/enum/Role").USER],
                created: +new Date(),
                lastLogin: null,
                address: null,
                phone: {business: null, mobile: null},
                work: [],
                businessInfo: {company: null, businessUrl: null},
                privateKey: null,
                membershipType: ["free"],
                virtual: false,
                userState: UserStatus.ON_HOLD
            }).save(function (err, user) {
                    if (err) {
                        emitter.emit(EventName.ERROR, err);
                    } else {
                        console.log(user);
                        emitter.emit(EventName.DONE, user);
                    }
                });
        } else {
            if (user.virtual) {
                user.userState = UserStatus.ON_HOLD;
                user.password = params.password;
                user.save(function (err, user) {
                    if (err) {
                        emitter.emit(EventName.ERROR, err);
                    } else {
                        console.log(user);
                        emitter.emit(EventName.DONE, user);
                    }
                });
            } else emitter.emit(EventName.NOT_FOUND, "E-mail Already Exists");
        }
    })
}.toEmitter();


exports.signUp = function (data) {
    log.info(data);
    var emitter = this;

    User.findOneAndUpdate({"_id": data._id}, { userState: UserStatus.PENDING_EMAIL_CONFIRMATION}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        else if (user) {
            exports.token(user._id, +new Date())
                .on(EventName.DONE, function (token) {
                    var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/emailVerificationMail.ejs', "utf8");
                    var html = EJS.render(file, {'link': _config.serverUrl + "/auth/verifyEmail/" + token, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl });
                    globalEvent.emit("OnEmailNotification", {
                        "emailId": user.email.primary,
                        "subject": 'ArtLock : Account verification',
                        "textMatter": html,
                        "cc": _config.email.copyTo && _config.email.copyTo.ON_USER_CREATED || []
                    });
                    emitter.emit(EventName.DONE, user);
                })
                .on(EventName.ERROR, function (err) {
                    log.info(err);
                    emitter.emit(EventName.ERROR, err);
                })
        }
        else
            emitter.emit(EventName.NOT_FOUND, "User Not Found");
    });
}.toEmitter();


exports.reSendVerification = function (data) {
    var emitter = this;
    User.findOneAndUpdate({"_id": data._id}, { userState: UserStatus.PENDING_EMAIL_CONFIRMATION}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user) {
            exports.token(user._id, +new Date())
                .on(EventName.DONE, function (token) {
                    var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/emailVerificationMail.ejs', "utf8");
                    var html = EJS.render(file, {'link': _config.serverUrl + "/auth/verifyEmail/" + token, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl });
                    globalEvent.emit("OnEmailNotification", {"emailId": user.email.primary,
                        "subject": 'Verify your account on ARTLOCK', "textMatter": html});
                    emitter.emit(EventName.DONE, user);
                })
                .on(EventName.ERROR, function (err) {
                    log.error(err);
                    emitter.emit(EventName.ERROR);
                })
        }
        else
            emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();


exports.changeEmail = function (params, user) {
    log.info(params);
    var emitter = this;

    User.findOneAndUpdate({"_id": user._id, password: params.password}, { 'email.primary': params.email}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        else if (user)
            emitter.emit(EventName.DONE, user);
        else
            emitter.emit(EventName.NOT_FOUND, "Wrong Password !!");
    });
}.toEmitter();


exports.updateEmail = function (user) {
    var emitter = this;
    User.findOneAndUpdate({"_id": user.userId}, { 'email.temp': user.email}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR, err);
        else if (user) {
            exports.token(user._id, +new Date())
                .on(EventName.DONE, function (token) {
                    var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/emailVerificationMail.ejs', "utf8");
                    var html = EJS.render(file, {'link': _config.serverUrl + "/auth/updateVerifyEmail/" + token, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", homeURL: _config.serverUrl });
                    globalEvent.emit("OnEmailNotification", {"emailId": user.email.temp,
                        "subject": 'ArtLock : Account verification', "textMatter": html});
                    emitter.emit(EventName.DONE, user);
                })
                .on(EventName.ERROR, function (err) {
                    log.error(err);
                    emitter.emit(EventName.ERROR, err);
                })
        }
        else
            emitter.emit(EventName.NOT_FOUND, "Wrong email");
    });
}.toEmitter();


exports.token = function (userId, timeStamp) {

    var emitter = this;
    var payload = {"_id": userId, "timeStamp": timeStamp};
    var secret = _config.jwtSecret;

    User.findOneAndUpdate({"_id": userId}, { 'emailTimeStamp': timeStamp}, {password: 0}, function (err, user) {
        log.trace(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user) {
            // encode
            var token = jwt.encode(payload, secret);
            if (token)
                emitter.emit(EventName.DONE, token);
            else
                emitter.emit(EventName.ERROR)
        }
        else
            emitter.emit(EventName.NOT_FOUND);
    });
    /*                  decode
     var decoded = jwt.decode(token, secret);*/
}.toEmitter();


exports.passwordToken = function (userId, timeStamp) {

    var emitter = this;
    var payload = {"_id": userId, "timeStamp": timeStamp};
    var secret = _config.jwtSecret;

    User.findOneAndUpdate({"_id": userId}, { 'passwordTimeStamp': timeStamp}, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user) {
            // encode
            var token = jwt.encode(payload, secret);
            if (token)
                emitter.emit(EventName.DONE, token);
            else
                emitter.emit(EventName.ERROR)
        }
        else
            emitter.emit(EventName.NOT_FOUND);
    });
    /*                  decode
     var decoded = jwt.decode(token, secret);*/
}.toEmitter();


exports.verifyEmail = function (tokenLink) {
    var emitter = this;
    log.trace(tokenLink);
    var decoded = jwt.decode(tokenLink.verificationToken, _config.jwtSecret);
    log.warn(decoded);
    User.findOneAndUpdate({"_id": decoded._id, emailTimeStamp: decoded.timeStamp}, { userState: UserStatus.PENDING_BASIC_PROFILE, emailTimeStamp: null, virtual: false }, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, decoded);
        else
            emitter.emit(EventName.NOT_FOUND);
    });

}.toEmitter();

exports.updateVerifyEmail = function (tokenLink) {
    var emitter = this;
    log.trace(tokenLink);
    var decoded = jwt.decode(tokenLink.verificationToken, _config.jwtSecret);
    log.warn(decoded);
    User.findOne({"_id": decoded._id, emailTimeStamp: decoded.timeStamp}, function (err, user) {
        if (err)
            console.log(err);
        else
            User.update({"_id": decoded._id}, {$set: {'email.primary': user.email.temp, 'email.temp': null}}, function (err, user) {
                log.warn(user);
                if (err)
                    emitter.emit(EventName.ERROR);
                else if (user) {
                    emitter.emit(EventName.DONE, user);
                }
                else
                    emitter.emit(EventName.NOT_FOUND);
            });
    });

}.toEmitter();


exports.resetPassword = function (tokenLink) {
    var emitter = this;
    log.trace(tokenLink);
    var decoded = jwt.decode(tokenLink.tokenId, _config.jwtSecret);
    log.warn(decoded);
    User.findOneAndUpdate({"_id": decoded._id, passwordTimeStamp: decoded.timeStamp}, { passwordTimeStamp: null }, {password: 0}, function (err, user) {
        log.warn(user);
        if (err)
            emitter.emit(EventName.ERROR);
        else if (user)
            emitter.emit(EventName.DONE, decoded);
        else
            emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();


exports.basicInfo = function (data) {
    log.info(data);
    var emitter = this;
    log.info(data.usertype);
    User.findOneAndUpdate({_id: data._id}, {$set: {firstName: data.firstname, lastName: data.lastname, country: data.country, zip: data.zip, userState: UserStatus.PENDING_COMPLETE_PROFILE}, $addToSet: {'roles': data.usertype}},
        function (err, result) {
            log.info("updated....", result);
            if (err)
                emitter.emit(EventName.ERROR, err);
            else if (result) {
                log.trace(result);
                emitter.emit(EventName.DONE, result);
            }
        })
}.toEmitter();


exports.generateHash = function (data) {
    var key = _config.hashKeySecret;
    var hash = crypto.createHmac('sha1', key).update(data).digest('hex');
    return hash;
};


exports.generatePrivateKey = function (keyName, userProfile) {
    var emitter = this;

    function generateKeyFileAndHash(keyName, userProfile) {
        var keyObject = {};
        var keyPath = __appBaseDir + '/src/userKeys/' + userProfile._id + ':' + keyName + ".pdf";
        var secretKey = Utils.generateRandomKey(8);
        var keyString = "\n\n " + userProfile.firstName + " " + userProfile.lastName + "\n\n Your " + keyName + " key on ARTLOCK is :\n\n " + secretKey;

        var doc = new PDF();
        doc.pipe(fs.createWriteStream(keyPath));
        doc.text(keyString, 50, 50);
        doc.end();
        keyObject.keyPath = keyPath;
        keyObject.keyHash = generateHash(secretKey);
        return keyObject;
    }

    function generateHash(data) {
        var key = _config.hashKeySecret;
        var hash = crypto.createHmac('sha1', key).update(data).digest('hex');
        return hash;
    }

    var keyObject = generateKeyFileAndHash(keyName, userProfile);

    User.findOneAndUpdate({_id: userProfile._id}, {$set: {privateKey: keyObject.keyPath, hashPrivateKey: keyObject.keyHash}},
        function (err, data) {
            if (err) {
                console.log(err);
                emitter.emit(EventName.ERROR, err);
            }
            if (data) {
                console.log(data);
                emitter.emit(EventName.DONE, data);
            }
        });

}.toEmitter();

exports.generateTradeKey = function (keyName, userProfile) {
    var emitter = this;

    function generateKeyFileAndHash(keyName, userProfile) {
        var keyObject = {};
        var keyPath = __appBaseDir + '/src/userKeys/' + userProfile._id + ':' + keyName + ".pdf";
        var secretKey = Utils.generateRandomKey(8);
        var keyString = "\n\n " + userProfile.firstName + " " + userProfile.lastName + "\n\n Your " + keyName + " key on ARTLOCK is :\n\n " + secretKey;

        var doc = new PDF();
        doc.pipe(fs.createWriteStream(keyPath));
        doc.text(keyString, 50, 50);
        doc.end();
        keyObject.keyPath = keyPath;
        keyObject.keyHash = generateHash(secretKey);
        return keyObject;
    }

    function generateHash(data) {
        var key = _config.hashKeySecret;
        var hash = crypto.createHmac('sha1', key).update(data).digest('hex');
        return hash;
    }

    var keyObject = generateKeyFileAndHash(keyName, userProfile);

    User.findOneAndUpdate({_id: userProfile._id}, {$set: {tradeKey: keyObject.keyPath, hashTradeKey: keyObject.keyHash}},
        function (err, data) {
            if (err) {
                console.log(err);
                emitter.emit(EventName.ERROR, err);
            }
            if (data) {
                console.log(data);
                emitter.emit(EventName.DONE, data);
            }
        });

}.toEmitter();


exports.generateCreatorKey = function (keyName, userProfile) {
    var emitter = this;

    function generateKeyFileAndHash(keyName, userProfile) {
        var keyObject = {};
        var keyPath = __appBaseDir + '/src/userKeys/' + userProfile._id + ':' + keyName + ".pdf";
        var secretKey = Utils.generateRandomKey(8);
        var keyString = "\n\n " + userProfile.firstName + " " + userProfile.lastName + "\n\n Your " + keyName + " key on ARTLOCK is :\n\n " + secretKey;

        var doc = new PDF();
        doc.pipe(fs.createWriteStream(keyPath));
        doc.text(keyString, 50, 50);
        doc.end();
        keyObject.keyPath = keyPath;
        keyObject.keyHash = generateHash(secretKey);
        return keyObject;
    }

    function generateHash(data) {
        var key = _config.hashKeySecret;
        var hash = crypto.createHmac('sha1', key).update(data).digest('hex');
        return hash;
    }

    var keyObject = generateKeyFileAndHash(keyName, userProfile);

    User.findOneAndUpdate({_id: userProfile._id}, {$set: {creatorKey: keyObject.keyPath, hashCreatorKey: keyObject.keyHash}},
        function (err, data) {
            if (err) {
                emitter.emit(EventName.ERROR, err);
            }
            if (data) {
                emitter.emit(EventName.DONE, data);
            }
        });

}.toEmitter();
