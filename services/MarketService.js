"use strict";

//Import Enums
var EventName = require("../src/enum/EventName");
var async = require("async");

var Utils = require("../src/Utils");

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



exports.getWorkByMarketId = function(marketId) {
    var emitter = this;
    Market.findOne({_id: marketId }, function (err, market) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            var tasks = [];
        console.log(market);
        // market.sites.works.forEach(function (workOrWorkCopyId) {
        //     tasks.push(function (callback) {
        //         var _tasks = [], work, workCopy;
        //         _tasks.push(function (callback) {
        //             Work.findOneAndPopulateCounts({_id: Utils.convertToObjectId(workOrWorkCopyId)}, {}, function (err, _work) {
        //                 if(err) callback(err);
        //                 else {
        //                     work = _work;
        //                     callback();
        //                 }
        //             });
        //         });

        //         _tasks.push(function (callback) {
        //             if (work) {
        //                 callback();
        //                 return;
        //             }
        //             WorkCopy.findOne({_id: Utils.convertToObjectId(workOrWorkCopyId)}, function (err, _workCopy) {
        //                 if (err) callback(err);
        //                 else {
        //                     if (_workCopy) {
        //                         workCopy = _workCopy;
        //                         Work.findOneAndPopulateCounts({_id: _workCopy.workId}, {}, function (err, _work) {
        //                             if (err) callback(err);
        //                             else if (_work) {
        //                                 work = _work;
        //                                 callback();
        //                             } else callback(new Error("Unable to fetch work."));
        //                         });
        //                     } else callback(new Error("Invalid id. Does not represent work or workCopy. " + workOrWorkCopyId));
        //                 }
        //             });
        //         });

        //         async.series(_tasks, function (err) {
        //             if (err) {
        //                 callback(err);
        //             } else {
        //                 workCopy && (work.workCopy = workCopy);
        //                 callback(null, work);
        //             }
        //         });
        //     });
        // });

        async.parallel(tasks, function (err, works) {
            if (!err) {
                log.trace(works);
                emitter.emit(EventName.DONE, works);
            }
        });
    })
}.toEmitter();