//Include dependencies
var EventName = require("../src/enum/EventName");
var dataToHttpStream = require("../custom_modules/dataToHttpStream");

exports.saveWork = function (req, res) {
    WorkService.saveWork(req.files, req.body.workData, req.user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.getWorkByUserId = function (req, res) {
    WorkService.getWorkByUserId(req.user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.getWorkById = function (req, res) {
    WorkService.getWorkById(req.query.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 500);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.getWorkAndOneOwnedCopyById = function (req, res) {
    WorkService.getWorkAndOneOwnedCopyById(req.query.workId, req.query.workCopyId, req.user._id)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 500);
        })
        .on(EventName.DONE, function (workAndCopy) {
            res.sendSuccessAPIResponse(workAndCopy);
        });
}.securedAPI();

exports.getWorkCopyById = function (req, res) {
    WorkService.getWorkCopyById(req.query.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 500);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.updateWork = function (req, res) {
    var workId = req.params['workId'];
    WorkService.updateWork(req.body, workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.deleteWork = function (req, res) {
    WorkService.deleteWork(req.body.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.getSellAbleWorksCount = function (req, res) {
    WorkService.getSellAbleWorksCount(req.user._id, req.param('mediaObject'))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (count) {
            res.sendSuccessAPIResponse(count);
        });
}.securedAPI();

exports.getInventoryWorks = function (req, res) {
    var offSet = req.params['offSet'];
    var limit = req.params['limit'];
    WorkService.getInventoryWorks(req.user, req.param('mediaObject'), offSet, limit)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.listReservedWorks = function (req, res) {
    WorkService.listReservedWorks(req.user, req.param('category'))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (works) {
            res.sendSuccessAPIResponse(works);
        });
}.securedAPI();

exports.getInventoryWorksCount = function (req, res) {
    WorkService.getInventoryWorksCount(req.user, req.param('mediaObject'))
        .on(EventName.DONE, function (data) {
            res.sendSuccessAPIResponse(data);
        })
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse("Error in counts. Try again later!");
        });
}.securedAPI();

exports.getUnclaimedWorks = function (req, res) {
    WorkService.getUnclaimedWorks(req.user, req.param('mediaObject'))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.removeFromSalesTransaction = function (req, res) {
    var workCopyId = req.param('workCopyId');
    WorkService.removeFromSalesTransaction(workCopyId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.updateSalesInfo = function (req, res) {
    var workId = req.params['workId'];
    WorkService.updateSalesInfo(workId, req.body)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();


exports.processMediaForStreaming = function (req, res) {
    WorkService.processMediaForStreaming(req.body)
        .on(EventName.DONE, function () {
            res.sendSuccessAPIResponse('File Processed');
        });
};

exports.streamMedia = function (req, res) {
    if (_config.streamMediaFromBuffer) {
        WorkService.streamMediaFromBuffer(req.query)
            .on(EventName.DONE, function (buffer, name, contentType) {
                dataToHttpStream.bufferToHTTPStream(req, res, buffer, name, contentType);
            })
            .on(EventName.NOT_FOUND, function () {
                res.sendErrorAPIResponse("Media Not Found", 204);
            });
    } else {
        WorkService.streamMediaFromLocalPath(req.query)
            .on(EventName.DONE, function (path) {
                dataToHttpStream.filePathToStream(req, res, path);
            })
            .on(EventName.NOT_FOUND, function () {
                res.sendErrorAPIResponse("Media Not Found", 204);
            });
    }
};

exports.getSellAbleWorks = function (req, res) {
    var offSet = req.params['offSet'];
    var limit = req.params['limit'];
    WorkService.getSellAbleWorks(req.user._id, req.param('mediaObject'), offSet, limit)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (works) {
            res.sendSuccessAPIResponse(works);
        });
}.securedAPI();

exports.fetchMediaThumbnail = function (req, res) {
    WorkService.fetchMediaThumbnail(req.params.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 404);
        })
        .on(EventName.DONE, function (file) {
            res.sendfile(file);
        });
};

exports.fetchMediaThumbnailWithoutWatermark = function (req, res) {
    WorkService.fetchMediaThumbnailWithoutWatermark(req.params.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 404);
        })
        .on(EventName.DONE, function (file) {
            res.sendfile(file);
        });
};

exports.fetchMediaForStreaming = function (req, res) {
    WorkService.fetchMediaForStreaming(req.params.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (file) {
            res.sendfile(file);
        });
}.securedAPI();


exports.fetchContractPDF = function (req, res) {
    WorkService.fetchContractPDF(req.params.workId, req.user._id, req.params.copyDetailId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 500);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err.message, 404);
        })
        .on(EventName.DONE, function (file) {
            res.sendfile(file);
        });
}.securedAPI();

exports.fetchCoaPDF = function (req, res) {
    WorkService.fetchCoaPDF(req.params.workId, req.user._id, req.params.copyDetailId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err, 404);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err.message, 404);
        })
        .on(EventName.DONE, function (file) {
            log.warn(file);
            res.sendfile(file);
        });
}.securedAPI();

exports.fetchPDFDocument = function (req, res) {
    WorkService.fetchPDFDocument(req.params.userId, req.params.type)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err.message, 404);
        })
        .on(EventName.DONE, function (file) {
            if (file) res.sendfile(file);
            else res.end("Key not generated yet!");
        });
}.securedAPI();

exports.transferOwnership = function (req, res) {
    WorkService.transferOwnership(req.body.buyerEmail, req.body.workCopyId, req.body.artFairAgreement, req.body.offeredFromLFP, req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err.message, 500);
        })
        .on(EventName.DONE, function (key) {
            res.sendSuccessAPIResponse(key);
        });
}.securedAPI();

exports.claimOwnership = function (req, res) {
    WorkService.claimOwnership(req.body.key, req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (work) {
            res.sendSuccessAPIResponse(work);
        });
}.securedAPI();

exports.resendTransferKey = function (req, res) {
    WorkService.resendTransferKey(req.param("workCopyId"), req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function () {
            res.sendSuccessAPIResponse();
        });
}.securedAPI();

exports.resendPaymentInfo = function (req, res) {
    WorkService.resendPaymentInfo(req.param("workCopyId"), req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (workCopy) {
            res.sendSuccessAPIResponse(workCopy);
        });
}.securedAPI();

exports.removeReservedWork = function (req, res) {
    WorkService.removeReservedWork(req.param("workCopyId"), req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function () {
            res.sendSuccessAPIResponse();
        });
}.securedAPI();

exports.validateTransferKey = function (req, res) {
    WorkService.validateTransferKey(req.body.loginEmail, req.body.key)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (key) {
            res.sendSuccessAPIResponse(key);
        });
}.securedAPI();

exports.publicWork = function (req, res) {
    WorkService.publicWork(req.params.publicKey)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.render('user/public-work', {work: null, error: "OOPS! No work found. Please check link or try again later."});
        })
        .on(EventName.DONE, function (work, artist, owner) {
            res.render('user/public-work', {work: work, artist: artist, owner: owner, error: null});
        });
};

exports.showEmbedWork = function (req, res) {
    WorkService.showEmbedWork(req.param("workId"))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.render('user/embed', {work: null, error: "Server Error"});
        })
        .on(EventName.DONE, function (work) {
            res.render('user/embed', {work: work, error: null});
        })
        .on(EventName.NOT_FOUND, function () {
            res.render('user/embed', {work: null, error: "No Preview Available!"});
        });
};

exports.fetchMediaForEmbedWork = function (req, res) {
    WorkService.fetchMediaForEmbedWork(req.params.workId)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.DONE, function (file) {
            res.sendfile(file);
        });
};

//Initiate the transfer flow
exports.initiateTransfer = function (req, res) {
    WorkService.initiateTransfer(req.body, req.user)
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.sendErrorAPIResponse(err.message);
        })
        .on(EventName.DONE, function (workId, copyId, copyNumber) {
            res.sendSuccessAPIResponse({workId: workId, copyId: copyId, copyNumber: copyNumber});
        });
}.securedAPI();
