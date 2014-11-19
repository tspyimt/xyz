"use strict";

//Import Enums
var EventName = require("../src/enum/EventName");
var async = require("async");

//Utils
var Utils = require("../src/Utils");

exports.savePlaylist = function (playlist, userId) {
    var emitter = this;
    new Playlist({
        userId: userId,
        title: playlist.title,
        works: [],
        created: +new Date()
    }).save(function (err, playlistCreated) {
            if (err) {
                log.error(err);
                emitter.emit(EventName.ERROR, err);
            }
            else {
                emitter.emit(EventName.DONE, playlistCreated);
            }
        });

}.toEmitter();


exports.getPlaylistByUserId = function (userId) {
    var emitter = this;
    Playlist.find({userId: userId }, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            emitter.emit(EventName.DONE, playlist);
        }
    })
}.toEmitter();


exports.addWorkToPlaylist = function (playlistId, workId) {
    var emitter = this;
    Playlist.update({_id: playlistId }, { $addToSet: { works: workId} }, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            console.log(playlist);
            emitter.emit(EventName.DONE, playlist);
        }
    })
}.toEmitter();


exports.removeWorkFromPlaylist = function (playlistId, workId) {
    var emitter = this;
    Playlist.update({_id: playlistId }, {$pull: { works: workId}}, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else {
            emitter.emit(EventName.DONE, playlist);
        }
    })
}.toEmitter();


exports.updatePlaylist = function (playlistToUpdate, playlistId) {
    var emitter = this;
    Playlist.update({_id: playlistId }, {$set: playlistToUpdate}, function (err, playlist) {
            if (err)
                emitter.emit(EventName.ERROR, err);
            else
                emitter.emit(EventName.DONE, playlist);
        }
    )
}.toEmitter();


exports.deletePlaylist = function (playlistId) {
    var emitter = this;
    Playlist.remove({_id: playlistId }, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, playlist);
    })
}.toEmitter();

exports.getWorksInPlaylist = function (playlistId) {
    var emitter = this;
    Playlist.findOne({_id: playlistId }, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            var tasks = [];
        console.log(playlist);
        playlist.works.forEach(function (workOrWorkCopyId) {
            tasks.push(function (callback) {
                var _tasks = [], work, workCopy;
                _tasks.push(function (callback) {
                    Work.findOneAndPopulateCounts({_id: Utils.convertToObjectId(workOrWorkCopyId)}, {}, function (err, _work) {
                        if(err) callback(err);
                        else {
                            work = _work;
                            callback();
                        }
                    });
                });

                _tasks.push(function (callback) {
                    if (work) {
                        callback();
                        return;
                    }
                    WorkCopy.findOne({_id: Utils.convertToObjectId(workOrWorkCopyId)}, function (err, _workCopy) {
                        if (err) callback(err);
                        else {
                            if (_workCopy) {
                                workCopy = _workCopy;
                                Work.findOneAndPopulateCounts({_id: _workCopy.workId}, {}, function (err, _work) {
                                    if (err) callback(err);
                                    else if (_work) {
                                        work = _work;
                                        callback();
                                    } else callback(new Error("Unable to fetch work."));
                                });
                            } else callback(new Error("Invalid id. Does not represent work or workCopy. " + workOrWorkCopyId));
                        }
                    });
                });

                async.series(_tasks, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        workCopy && (work.workCopy = workCopy);
                        callback(null, work);
                    }
                });
            });
        });

        async.parallel(tasks, function (err, works) {
            if (!err) {
                log.trace(works);
                emitter.emit(EventName.DONE, works);
            }
        });
    })
}.toEmitter();

exports.updatePlaylist = function (playlistId, params) {
    var emitter = this;
    Playlist.update({_id: playlistId }, {$set: params}, function (err, playlist) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, playlist);
    })
}.toEmitter();