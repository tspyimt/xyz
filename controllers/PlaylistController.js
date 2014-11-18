

//Include dependencies
var EventName = require("../src/enum/EventName");

exports.savePlaylist = function (req, res) {
    var user = req.checkLoggedIn();
    PlaylistService.savePlaylist(req.body, user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();

exports.getPlaylistByUserId = function (req, res) {
    var user = req.checkLoggedIn();
    PlaylistService.getPlaylistByUserId(user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();


exports.addWorkToPlaylist = function (req, res) {
    PlaylistService.addWorkToPlaylist(req.body.playlistId, req.body.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();

exports.removeWorkFromPlaylist = function (req, res) {
    PlaylistService.removeWorkFromPlaylist(req.body.playlistId, req.body.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();


exports.updatePlaylist = function (req, res) {
    PlaylistService.updatePlaylist(req.body, req.body.playlistId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();

exports.deletePlaylist = function (req, res) {
    PlaylistService.deletePlaylist(req.body.playlistId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (playlist) {
            res.sendSuccessAPIResponse(playlist);
        });
}.secured();

exports.getWorksInPlaylist = function (req, res) {
  PlaylistService.getWorksInPlaylist(req.params.playlistId)
      .on(EventName.ERROR, function (err) {
        log.error(err);
        res.sendErrorAPIResponse(err);
      })
      .on(EventName.DONE, function (works) {
        res.sendSuccessAPIResponse(works);
      });
}.secured();

exports.updatePlaylist = function (req, res) {
  PlaylistService.updatePlaylist(req.params.playlistId, req.body)
      .on(EventName.ERROR, function (err) {
        log.error(err);
        res.sendErrorAPIResponse(err);
      })
      .on(EventName.DONE, function (works) {
        res.sendSuccessAPIResponse(works);
      });
}.secured();