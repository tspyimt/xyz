"use strict";

//Import modules
var async = require("async");

/**
 * Handler for the event OnWorkClaimed
 * */
exports.onEvent = function (seller, buyer, work, workCopy) {

    log.debug("Work has been claimed!", seller, buyer, work, workCopy);

    //Remove from old owner playlist.
    removeWorkFromSellerPlayListsIfNoCopiesAreOwned(seller, buyer, work, workCopy);

};

function removeWorkFromSellerPlayListsIfNoCopiesAreOwned(seller, buyer, work, workCopy) {

    var tasks = [], ownsWork = false;

    //Check if seller still owns any copy of work
    tasks.push(function (callback) {
        WorkCopy.count({
            "currentOwnership.ownerId": seller._id,
            "workId": work._id
        }, function (err, count) {
            if (err) callback(err);
            else if (count) callback(null, ownsWork = true);
            else callback(null, ownsWork = false);
        });
    });

    //If no copy is owned then remove from all playlists
    tasks.push(function (callback) {
        if (ownsWork) {
            log.debug("Seller still owns copies, no need to remove from playlists.");
            callback();
            return;
        }
        Playlist.update({
            userId: seller._id.toString()
        }, {
            $pull: { works: work._id.toString()}
        }, {upsert: false, multi: true}, function (err, playlist) {
            if (err) callback(err);
            else {
                log.debug("Removed work from playlists", work, playlist);
                callback();
            }
        });
    });

    async.series(tasks, function (err) {
        if (err) {
            log.error(err);
        }
    });
}