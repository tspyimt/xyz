/**
 * Dashboard Controller
 *
 * Handles the routes responsible for dashboard actions
 *
 * */

//Include dependencies
var EventName = require("../src/enum/EventName");
var HTTP_CODES = require("../src/enum/HttpStatusCode");

/**
 * Handles the route which renders the users dashboard
 * @url "/user/dashboard"
 * */

exports.dashboard = function (req, res) {
    log.info("dashboard-----", req.user);
    //Todo send user session along with dashboard page
    res.render('user/dashboard', {user: req.checkLoggedIn()});
}.secured();


exports.mainscreen = function (req, res) {
    log.info("Main Screen-----", req.user);
    //Todo send user session along with dashboard page
    res.render('user/main-screen', {user: req.checkLoggedIn()});
    console.log(req.user);
    //Todo send user session along with dashboard page
    res.render('user/dashboard');
}.secured();

/**
 * Handles the route which check if given key is valid or not and return user corresponding to key in case valid.
 * @url "/user/checkValidPrivateKey"
 * */

exports.checkValidPrivateKey = function (req, res) {
    DashboardService.checkValidPrivateKey(req.body.key)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.NOT_FOUND, function () {
            res.sendErrorAPIResponse("Error: User not found.", HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });

}.secured();

exports.checkValidCreatorKey = function (req, res) {
    DashboardService.checkValidCreatorKey(req.body.key)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.NOT_FOUND, function () {
            res.sendErrorAPIResponse("Error: User not found.", HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });

}.secured();

exports.checkValidTradeKey = function (req, res) {
    DashboardService.checkValidTradeKey(req.body.key)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.NOT_FOUND, function () {
            res.sendErrorAPIResponse("Error: User not found.", HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.secured();

exports.checkValidKeyByUserRole = function (req, res) {
    var user = req.checkLoggedIn();
    DashboardService.checkValidKeyByUserRole(user, req.body.key)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.NOT_FOUND, function () {
            res.sendErrorAPIResponse("Error: User not found.", HTTP_CODES.SERVER_ERROR);
        })
        .on(EventName.DONE, function (user) {
            res.sendSuccessAPIResponse(user);
        });
}.secured();