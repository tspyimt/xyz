var PDF = require('pdfkit');
var fs = require('fs');
var PDFKit = require('pdfkitjs');
var phantom = require('node-phantom');
var ejs = require('ejs');
var path = require('path');
var async = require('async');
var content;

exports.onEvent = function (seller, buyer, artist, work, workCopy, callback) {

    var tasks = [],
        contractUrl,
        ejsRaw,
        html;

    //Get the ejs file
    tasks.push(function (callback) {
        fs.readFile(__dirname + '/../web-app/views/contract.ejs', "utf8", function (err, output) {
            if (err) callback(err);
            else {
                ejsRaw = output;
                callback();
            }
        });
    });

    //url
    tasks.push(function (callback) {
        contractUrl = path.join(_config.mediaStorage.storageBaseDir, [
            "contract",
            workCopy._id.toString(),
            buyer._id.toString(),
            '.pdf'
        ].join("_"));
        callback();
    });

    //Build html
    tasks.push(function (callback) {
        html = ejs.render(ejsRaw, {
            logo: _config.serverUrl + '/img/logo_100px_black.png',
            work: work,
            artist: artist,
            seller: seller,
            buyer: buyer,
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
                page.onResourceRequested = function (rd) {
                    console.log("REQUESTING:: ", rd[0]["url"]);
                };
                page.onResourceReceived = function (rd) {
                    rd.stage == "end" && console.log("LOADED:: ", rd["url"]);
                };

                page.onLoadFinished = function (status) {
                    page.render(contractUrl, function (error) {
                        if (error) console.log('Error rendering PDF: %s', error);
                        console.log("PDF Generated....", status);
                        ph.exit();
                        callback && callback();
                    });
                }
            });
        });
    });

    async.series(tasks, function (err) {
        if (err)callback(err);
        else callback(null, contractUrl);
    });
};





