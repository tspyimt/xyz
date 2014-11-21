/**
 * User Controller
 *
 * Handles the routes responsible for URLs related to User domain
 *
 * */

var EventName = require('../src/enum/EventName');

/**
 * Handles the route which gives back the current user in response
 * @url "//api/user/current"
 * */


exports.getUser = function (req, res) {
    UserService.getUser(req.checkLoggedIn())
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.securedAPI();


exports.updateUser = function (req, res) {
    // log.trace(req.body);
    // log.trace(req.checkLoggedIn());
    UserService.updateUser(req.checkLoggedIn(), req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.securedAPI();

exports.getUserEmailId = function (req, res) {
    UserService.getUserEmailId(req.param('userId'))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 403);
        })
        .on(EventName.DONE, function (email) {
            res.sendSuccessAPIResponse(email);
        });
}.securedAPI();

exports.uploadAvtController = function (req, res) {
    UserService.uploadingAvtService(req.files.file.path, req.files.file.name, req.param('userId'))
        .on("error", function (err) {
            log.error(err);
            res.send(err);
        })
        .on("success", function () {
            res.send('updated');
        })
}.securedAPI();