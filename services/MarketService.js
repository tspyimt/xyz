"use strict";

//Import Enums
var EventName = require("../src/enum/EventName");
var async = require("async");

// var Utils = require("../src/Utils");

// Save the market to database.
exports.saveMarket = function (market, userId) {
    var emitter = this;
    new Market({
        userId: userId,
        sites: {
        	name: market.name,
        	works: []
        },
        created: +new Date()
    }).save(function (err, makretCreated) {
            if (err) {
                log.error(err);
                emitter.emit(EventName.ERROR, err);
            }
            else {
                emitter.emit(EventName.DONE, makretCreated);
            }
        });

}.toEmitter();

// Get market by user id
exports.getMarketByUserId = function (userId) {
    var emitter = this;
    Market.find({userId: userId }, function (err, market) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            emitter.emit(EventName.DONE, market);
        }
    })
}.toEmitter();


exports.addWorkToMarket = function (marketID, workId) {
    var emitter = this;
    Market.update({_id: marketID }, { $addToSet: { 'sites.works': workId } }, function (err, market) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            console.log(market);
            emitter.emit(EventName.DONE, market);
        }
    })
}.toEmitter();


exports.removeWorkFromMarket = function (marketId, workId) {
    var emitter = this;
    Market.update({_id: marketId }, {$pull: { 'sites.works': workId}}, function (err, market) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            emitter.emit(EventName.DONE, market);
        }
    })
}.toEmitter();