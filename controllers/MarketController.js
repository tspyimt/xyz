
//Include dependencies
var EventName = require("../src/enum/EventName");

exports.saveMarket = function (req, res) {
	var user = req.checkLoggedIn();
    MarketService.saveMarket(req.body, user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (market) {
            res.sendSuccessAPIResponse(market);
        });
}.secured();

exports.getMarketByUserId = function (req, res) {
    var user = req.checkLoggedIn();
    // log.info(user._id);
    MarketService.getMarketByUserId(user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (market) {
            res.sendSuccessAPIResponse(market);
        });
}.secured();

exports.addWorkToMarket = function (req, res) {
    MarketService.addWorkToMarket(req.body.marketId, req.body.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (market) {
            res.sendSuccessAPIResponse(market);
        });
}.secured();

exports.removeWorkFromMarket = function (req, res) {
    MarketService.removeWorkFromMarket(req.body.marketId, req.body.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (market) {
            res.sendSuccessAPIResponse(market);
        });
}.secured()