var PDF = require('pdfkit');
var fs = require('fs');
var Utils = require('../src/Utils');
var phantom = require('node-phantom');
var ejs = require('ejs');
var path = require('path');
var async = require('async');
var content;

exports.onEvent = function (work, workCopy, callback) {

    var tasks = [],
        ejsRaw,
        artistIdObj,
        artistObj,
        coaURL,
        countTotalWorks,
        countArtRent,
        countExhibition,
        html;

    //Get the ejs file
    tasks.push(function (callback) {
        fs.readFile(__dirname + '/../web-app/views/coa.ejs', "utf8", function (err, output) {
            if (err) callback(err);
            else {
                ejsRaw = output;
                callback();
            }
        });
    });

    //Get artist
    tasks.push(function (callback) {
        artistIdObj = Utils.convertToObjectId(work.artistUserId);
        if (!artistIdObj) {
            callback(new Error("Invalid artist ID " + work.artistUserId));
            return;
        }
        User.findOne({_id: artistIdObj}, function (err, artist) {
            if (err) {
                log.error(err);
                callback(new Error("System Error, unable to get seller info!"));
            } else if (Boolean(artist)) {
                artistObj = artist;
                callback();
            } else {
                callback(new Error("Artist Not found or ID: " + work.artistUserId));
            }
        });
    });

    //Generate counts
    tasks.push(function (callback) {
        countTotalWorks = work.edition;
        countArtRent = work.copyForArtRent;
        countExhibition = work.copyForExhibition;
        callback();
    });

    //url
    tasks.push(function (callback) {
        coaURL = path.join(_config.mediaStorage.storageBaseDir, [
            "coa",
            workCopy._id.toString(),
            artistObj._id.toString(),
            '.pdf'
        ].join("_"));
        callback();
    });

    //Build html
    tasks.push(function (callback) {
        html = ejs.render(ejsRaw, {
            logo: _config.serverUrl + '/img/logo_100px_black.png',
            work: work,
            artist: artistObj,
            countTotalWorks: countTotalWorks,
            countArtRent: countArtRent,
            countExhibition: countExhibition,
            audio: _config.serverUrl + '/img/user/audio_thumbnail.jpg',
            thumbnail: _config.serverUrl + '/api/workThumbnail/' + work._id,
            workCopy: workCopy
        });
        callback();
    });

    //build pdf
    tasks.push(function (callback) {
        phantom.create(function (error, ph) {
            if (error) {
                callback(error);
                return;
            }

            ph.createPage(function (error, page) {
                if (error) {
                    callback(error);
                    return;
                }
                page.settings = {
                    loadImages: true,
                    localToRemoteUrlAccessEnabled: true,
                    javascriptEnabled: true,
                    loadPlugins: false
                };
                page.set('viewportSize', { width: 800, height: 600 });
                page.set('paperSize', { format: 'A4', orientation: 'portrait', border: '1cm' });
                page.set('content', html, function (error) {
                    if (error) {
                        console.log('Error setting content: %s', error);
                        callback(error);
                    }
                });

                //This is maily for debugging, to see if the resources are requested/Loaded or not..
                page.onResourceRequested = function (rd, req) {
                    console.log("REQUESTING:: ", rd[0]["url"]);
                };
                page.onResourceReceived = function (rd) {
                    rd.stage == "end" && console.log("LOADED:: ", rd["url"]);
                };

                page.onLoadFinished = function (status) {
                    page.render(coaURL, function (error) {
                        if (error) console.log('Error rendering PDF: %s', error);
                        console.log("PDF Generated....", status);
                        ph.exit();
                        callback && callback();
                    });
                }
            });
        });
    });

    async.series(tasks, function(err){
      if(err)callback(err);
      else callback(null, coaURL);
    });
};