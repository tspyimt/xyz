/**
 * Auth Controller
 *
 * Handles the routes responsible for registration and authenticating users
 *
 * */

//Include dependencies
var EventName = require("../src/enum/EventName");


/**
 * Handles the route which authorizes the user to login and creates session
 * @url "/api/auth/login"
 * */

exports.authenticate = function (req, res) {
    AuthService.authenticate(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            res.loginUser(user._id.toString(), user.roles);
            res.sendSuccessAPIResponse(user);
        });
};

/**
 * Handles the route which renders the users login/sign-in page
 * @url "/auth/signIn"
 * */

exports.signIn = function (req, res) {
    if (req.checkLoggedIn())
        res.redirect('/user/dashboard');
    else
        res.render('user/index');
};


exports.tos = function (req, res) {
    res.render('user/tos');
};


exports.emailVerification = function (req, res) {
    AuthService.emailVerification(req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            log.error(user);
            res.render('user/email-verification', {"email": user.email.primary, "_id": user._id});
        })

}.secured("admin", "user", "artist", "artist representative", "collector", "curator", "art enthusiast");


exports.emailVerified = function (req, res) {
    console.log(">>>>>>>>>>>", req.user);
    AuthService.emailVerified(req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            log.error(user);
            res.render('user/basicInfo', {"_id": user._id});
        })

}.secured("admin", "user", "artist", "artist representative", "collector", "curator", "art enthusiast");


/*
 * @url "/auth/logout"
 * */

exports.logout = function (req, res) {
    res.logoutUser();
    res.redirect('/auth/signIn');
};

exports.agreeTerms = function (req, res) {
    log.info(req.user);
    if (req.user)
        res.render('user/agree-terms', {"_id": req.user._id});
}.secured("admin", "user", "artist", "artist representative", "collector", "curator", "art enthusiast");


exports.signUpClick = function (req, res) {
    AuthService.signUpClick(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            log.error(user);
            res.loginUser(user._id.toString(), user.roles);
            res.sendSuccessAPIResponse("send");
        })
};


exports.changePassword = function (req, res) {
    AuthService.changePassword(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            log.info(user);
            res.sendSuccessAPIResponse("send");
        })
};


exports.changePasswordClick = function (req, res) {
    log.trace(req.body);
    AuthService.changePasswordClick(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            log.error(user);
            res.sendSuccessAPIResponse("success");
        })
};


/**
 * Handles the route which renders the users login/sign-in page
 * @url "/api/auth/signUp"
 * */

exports.signUp = function (req, res) {
    AuthService.signUp(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403)
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse("Verification Mail Send");
        });
};

/**
 * Handles the route which renders the users login/sign-in page
 * @url "/auth/verifyEmail/:token"
 * */

exports.updateVerifyEmail = function (req, res) {
    log.info(req.params);
    AuthService.updateVerifyEmail(req.params)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            log.info("user------>", user);
            res.redirect('/');
        });
};

exports.verifyEmail = function (req, res) {
    AuthService.verifyEmail(req.params)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            log.info("user------>", user);
            res.render('user/basicInfo', {"_id": user._id});
        });
};


/**
 * Handles the route which renders the users login/sign-in page
 * @url "/api/auth/changeEmail"
 * */

exports.changeEmail = function (req, res) {
    console.log(req.user);
    AuthService.changeEmail(req.body, req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.secured("admin", "user", "artist", "artist representative", "collector", "curator", "art enthusiast");


exports.updateEmail = function (req, res) {
    AuthService.updateEmail(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse("send");
        });
}


exports.resetPassword = function (req, res) {
    log.warn(req.params);
    AuthService.resetPassword(req.params)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            log.info("user------>", user);
            res.render('user/change-password', {"_id": user._id});
        });
};


exports.reSendVerification = function (req, res) {
    AuthService.reSendVerification(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse("send");
        });
}.secured("admin", "user", "artist", "artist representative", "collector", "curator", "art enthusiast");

exports.basicInfo = function (req, res) {
    log.info("info-----", req.body);
    AuthService.basicInfo(req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (user) {
            res.loginUser(user._id.toString(), user.roles);
            res.sendSuccessAPIResponse(user);
        });
};


exports.generatePrivateKey = function (req, res) {
    log.trace(req.body);
    AuthService.generatePrivateKey('private', req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (key) {
            res.sendSuccessAPIResponse(key);
        });
}.secured();

exports.generateTradeKey = function (req, res) {
    AuthService.generateTradeKey('trade', req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (key) {
            res.sendSuccessAPIResponse(key);
        });
}.secured();


exports.generateCreatorKey = function (req, res) {
    log.trace(req.body);
    AuthService.generateCreatorKey('creator', req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.secured();