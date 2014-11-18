"use strict";
var mongoose = require('mongoose');

var fs = require('fs');
var request = require('request');
var async = require('async');
var paypal_sdk = require('paypal-rest-sdk');
var path = require("path");
var Utils = require("../src/Utils");
var EJS = require("ejs");
var _ = require("underscore");

//Import Enums
var EventName = require("../src/enum/EventName");
var OwnerClassType = require("../src/enum/OwnerClassType");
var UserStatus = require("../src/enum/UserStatus");
var mediaProcessor = require("../custom_modules/mediaProcessor");
var mediaStorage = require("../custom_modules/mediaStorageInterface");

exports.saveWork = function (file, work, userId) {
    var emitter = this;
    var userIdObj = Utils.convertToObjectId(userId);
    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User Id: " + userId));
        return;
    }

    User.findOne({'_id': userIdObj}, {firstName: 1, lastName: 1}, function (err, user) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else if (user) {
            mediaProcessor.getMetaData(file.media.path, function (metadata) {
                log.info(metadata);
                work = JSON.parse(work);
                fs.readFile(file.media.path, function (err, buffer) {
                    if (err) {
                        emitter.emit(EventName.ERROR, err);
                        return;
                    }
                    mediaStorage.storeMediaContent(buffer, metadata, file.media.name, work.category, function (err, storedFile) {
                        if (err) {
                            log.error(err);
                            emitter.emit(EventName.ERROR, err);
                        } else {
                            new Work({
                                artistUserId: userId,
                                artistName: user.firstName + " " + user.lastName,
                                year: work.year,
                                category: work.category,
                                title: work.title,
                                material: work.material,
                                description: work.description,
                                mediaStorageIndexId: storedFile._id,
                                availableForSale: false,
                                created: +new Date(),
                                metadata: metadata,
                                publicKey: Utils.generateRandomKey(8)
                            }).save(function (err, workCreated) {
                                    if (err) {
                                        log.error(err);
                                        emitter.emit(EventName.ERROR, err);
                                    } else {
                                        emitter.emit(EventName.DONE, workCreated);
                                    }
                                });
                        }
                    });
                });
            });
        } else {
            emitter.emit(EventName.NOT_FOUND, new Error("User not found for ID: " + userId));
        }
    })
}.toEmitter();

exports.getWorkByUserId = function (userId) {
    var emitter = this;
    Work.find({artistUserId: userId }, function (err, work) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, work);
    })
}.toEmitter();

exports.updateWork = function (workToUpdate, workId) {
    var emitter = this;
    Work.update({_id: workId }, {$set: workToUpdate}, function (err, work) {
            if (err)
                emitter.emit(EventName.ERROR, err);
            else {
                emitter.emit(EventName.DONE, work);
            }
        }
    )
}.toEmitter();

exports.deleteWork = function (workId) {
    var emitter = this;
    Work.remove({_id: workId }, function (err, work) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, work);
    })
}.toEmitter();

exports.getWorkById = function (workId) {
    var emitter = this;
    Work.findOneAndPopulateCounts({_id: workId }, {}, function (err, work) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, work);
    })
}.toEmitter();

exports.getWorkCopyByIds = function (workId) {
    var emitter = this;
    WorkCopy.findOne({
        workId: Utils.convertToObjectId(workId)
    }, function (err, workCopy) {
        if (err)
            emitter.emit(EventName.ERROR, err);
        else
            emitter.emit(EventName.DONE, workCopy);
    })
}.toEmitter();

exports.getWorkAndOneOwnedCopyById = function (workId, workCopyId, userId) {
    var emitter = this;

    var tasks = [], work, workCopyLFP, workCopyNonLFP, totalLFPAvailable, totalAvailable, workCopy;


    //Fetch work Info
    tasks.push(function (callback) {
        Work.findOneAndPopulateCounts({_id: workId }, {}, function (err, _work) {
            if (err) callback(err);
            else if (_work) callback(null, work = _work.toObject && _work.toObject() || _work);
            else callback(new Error("Work not found!"));
        });
    });

    //Fetch LFP work copy
    tasks.push(function (callback) {
        if (workCopyId) {
            callback(null);
            return;
        }
        WorkCopy.find({
            workId: Utils.convertToObjectId(workId),
            "currentOwnership.ownerId": Utils.convertToObjectId(userId),
            "availableForSale": true,
            "copyTypeLFP": true,
            "transferTo.active": false
        }).sort({copyNumber: 1}).limit(1).exec(function (err, workCopy) {
                if (err) emitter.emit(EventName.ERROR, err);
                else callback(null, workCopy.length && (workCopyLFP = workCopy[0]));
            });
    });

    //Fetch Non LFP work copy
    tasks.push(function (callback) {
        if (workCopyId) {
            callback(null);
            return;
        }
        WorkCopy.find({
            workId: Utils.convertToObjectId(workId),
            "currentOwnership.ownerId": Utils.convertToObjectId(userId),
            "availableForSale": true,
            "copyTypeLFP": false,
            "transferTo.active": false
        }).sort({copyNumber: 1}).limit(1).exec(function (err, workCopy) {
                if (err) emitter.emit(EventName.ERROR, err);
                else callback(null, workCopy.length && (workCopyNonLFP = workCopy[0]));
            });
    });

    //Fetch exact work copy
    tasks.push(function (callback) {
        if (!workCopyId) {
            callback(null);
            return;
        }
        WorkCopy.findOne({_id: Utils.convertToObjectId(workCopyId)}, function (err, _workCopy) {
            if (err) emitter.emit(EventName.ERROR, err);
            else callback(null, workCopy = _workCopy);
        });
    });

    //Total LFP available
    tasks.push(function (callback) {
        WorkCopy.count({
            workId: Utils.convertToObjectId(workId),
            "currentOwnership.ownerId": Utils.convertToObjectId(userId),
            "availableForSale": true,
            "copyTypeLFP": true,
            "transferTo.active": false
        }, function (err, count) {
            if (err) emitter.emit(EventName.ERROR, err);
            else callback(null, totalLFPAvailable = count);
        });
    });

    //Total available
    tasks.push(function (callback) {
        WorkCopy.count({
            workId: Utils.convertToObjectId(workId),
            "currentOwnership.ownerId": Utils.convertToObjectId(userId),
            "availableForSale": true,
            "transferTo.active": false
        }, function (err, count) {
            if (err) emitter.emit(EventName.ERROR, err);
            else callback(null, totalAvailable = count);
        });
    });

    async.parallel(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else {
            work.workCopyNonLFP = workCopyNonLFP;
            work.workCopyLFP = workCopyLFP;
            work.totalAvailable = totalAvailable;
            work.totalLFPAvailable = totalLFPAvailable;
            work.workCopy = workCopy;
            emitter.emit(EventName.DONE, work);
        }
    });
}.toEmitter();

exports.getWorkCopyById = function (workId) {
    var emitter = this;
    var tasks = [],
        workCopy,
        workInfo;

    tasks.push(function (callback) {
        WorkCopy.findOne({_id: workId }, {}, function (err, work) {
            if (err)
                callback(err);
            else if (work) {
                workCopy = work;
                callback();
            } else callback(new Error("Work Copy Not Found!"));
        })
    });

    tasks.push(function (callback) {
        Work.findOneAndPopulateCounts({_id: workCopy.workId }, {}, function (err, work) {
            if (err)
                callback(err);
            else if (work) {
                workInfo = work;
                callback();
            } else callback(new Error("Work not found!"));
        })
    });

    async.series(tasks, function (err) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else {
            workCopy = workCopy.toObject();
            workCopy.workInfo = workInfo;
            emitter.emit(EventName.DONE, workCopy);
        }
    });
}.toEmitter();

exports.getSellAbleWorksCount = function (userId, mediaCategory) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(userId);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", userId));
        return;
    }

    //Build query
    var query = {
        "currentOwnership.ownerId": userIdObj,
        "availableForSale": true,
        "transferTo.active": false
    };
    if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;

    //Get the count
    WorkCopy.aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: "$workId"
            }
        },
        {
            $group: {
                _id: 1,
                count: {
                    $sum: 1
                }
            }
        }
    ], function (err, res) {
        log.trace(arguments);
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, {count: res && res[0].count || 0});
    });
}.toEmitter();

exports.getInventoryWorks = function (user, mediaCategory, offSet, limit) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(user._id);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", user._id));
        return;
    }

    var dataProvider = null;

    if (Utils.isArtist(user)) {
        dataProvider = function (callback) {
            //Build query
            var query = {
                "artistUserId": userIdObj
            };
            if (mediaCategory != 'all') query["category"] = mediaCategory;
            Work.findAndPopulateCounts(query, {
                artistUserId: 1,
                artistName: 1,
                title: 1,
                category: 1,
                edition: 1,
                copyForArtRent: 1,
                copyForExhibition: 1,
                availableForSale: Boolean,
                stillAnnotatedImage: 1,
                stillAnnotatedImageWithoutWatermark: 1
            }, callback);
        };
    }
    else {
        dataProvider = function (callback) {
            var query = {
                "currentOwnership.ownerId": userIdObj
            };
            if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;
            WorkCopy.find(query, {}, callback);
        };
    }

    dataProvider(function (err, works) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, works);
    });

}.toEmitter();

exports.listReservedWorks = function (user, mediaCategory) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(user._id);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", user._id));
        return;
    }

    var query = {
        "currentOwnership.ownerId": userIdObj,
        "transferTo.active": true,
        "transferTo.unclaimed": false
    };
    if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;
    WorkCopy.find(query, {}, function (err, workCopies) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, workCopies);
    });

}.toEmitter();

exports.getInventoryWorksCount = function (user, mediaCategory) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(user._id);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", user._id));
        return;
    }

    var dataProvider = null;

    if (Utils.isArtist(user)) {
        dataProvider = function (callback) {
            //Build query
            var query = {
                "artistUserId": userIdObj
            };
            if (mediaCategory != 'all') query["category"] = mediaCategory;

            Work.count(query, callback);
        };
    } else {
        dataProvider = function (callback) {
            var query = {
                "currentOwnership.ownerId": userIdObj
            };
            if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;
            WorkCopy.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: "$workId"
                    }
                },
                {
                    $group: {
                        _id: "$workId",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ], function (err, res) {
                log.trace(arguments);
                callback(err, res && res[0].count);
            });
        };
    }

    dataProvider(function (err, counts) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, counts);
    });
}.toEmitter();

exports.getUnclaimedWorks = function (user, mediaCategory) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(user._id);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", user._id));
        return;
    }

    var query = {
        'transferTo.active': true,
        'transferTo.unclaimed': true,
        "currentOwnership.ownerId": userIdObj
    };

    if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;

    WorkCopy.find(query, function (err, workCopies) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, workCopies || []);
    });

}.toEmitter();

exports.removeFromSalesTransaction = function (workCopyId) {
    var emitter = this;
    var workCopyIdObject = Utils.convertToObjectId(workCopyId);
    WorkCopy.update({_id: workCopyIdObject}, {$set: {
            "transferTo.unclaimed": false,
            "transferTo.active": false,
            "availableForSale": true
        }}, function (err, work) {
            if (err)
                emitter.emit(EventName.ERROR, err);
            else if (work) {
                emitter.emit(EventName.DONE, work);
            }
            else {
                emitter.emit(EventName.ERROR, new Error('workCopyId not found'));
            }
        }
    )
}.toEmitter();

exports.processMediaForStreaming = function (params) {
    var emitter = this;
    Work.findOne({_id: params.workId}, function (err, work) {
        MediaStorageIndex.findOne({_id: work.mediaStorageIndexId}, function (err, workIndex) {
            mediaProcessor.convertMedia(workIndex.filePath, work.category, workIndex, params.time, params.text, function (files) {
                log.trace(files);
                if (files) {
                    var stillAnnotatedImage = JSON.parse(JSON.stringify(files)).stillAnnotatedImage;
                    var stillAnnotatedImageWithoutWatermark = JSON.parse(JSON.stringify(files)).stillAnnotatedImageWithoutWatermark;
                    MediaStorageIndex.update({_id: work.mediaStorageIndexId}, {$set: {
                        'filePath': files || null,
                        'stillAnnotatedImage': stillAnnotatedImage || null,
                        'stillAnnotatedImageWithoutWatermark': stillAnnotatedImageWithoutWatermark || null
                    }}, function (err, updated) {
                        Work.update({_id: params.workId}, {$set: {'stillAnnotatedImage': stillAnnotatedImage || null, 'stillAnnotatedImageWithoutWatermark': stillAnnotatedImageWithoutWatermark, ' availableForSale': true}}, function (err, work) {
                            if (err) log.error(err);
                            WorkCopy.update({workId: Utils.convertToObjectId(params.workId)}, {$set: {availableForSale: true}}, {multi: true}, function (err) {
                                if (err) log.error(err);
                                log.trace('File Processing Completed', params.workId);
                            });
                        });
                    });
                } else {
                    log.error("\nCould not upload/convert the work..");
                }
            });
        });
        emitter.emit(EventName.DONE);
    });
}.toEmitter();

exports.updateSalesInfo = function (workId, data) {
    var emitter = this;

    var tasks = [],
        workObj;

    //take in defaults
    tasks.push(function (callback) {
        data.availableForSale = true;
        callback();
    });

    //Fetch work
    tasks.push(function (callback) {
        var workIdObj = Utils.convertToObjectId(workId);
        if (!workIdObj) {
            callback(new Error("Invalid Id of work: " + workId));
            return;
        }
        Work.findOne({_id: workIdObj}, function (err, work) {
            if (err) {
                callback(err);
            } else if (Boolean(work)) {
                workObj = work;
                callback();
            } else callback(new Error("Work not found for ID: " + workId));
        });
    });

    //Update work
    tasks.push(function (callback) {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                workObj[i] = data[i];
            }
        }
        callback();
    });

    //Create WorkCopy records
    tasks.push(function (callback) {
        var _tasks = [], i;

        for (i = 1; i <= (data.edition - data.copiesOnMDisk); i++) {
            _tasks.push((function (copyNumber) {
                return function (callback) {
                    new WorkCopy({
                        currentOwnership: {
                            ownerId: workObj.artistUserId,
                            currency: workObj.currency,
                            price: workObj.pricePerWork,
                            ownerSinceTimeStamp: +new Date()
                        },
                        transferTo: {
                            active: false
                        },
                        publicKey: Utils.generateRandomKey(8),
                        copyTypeLFP: false,
                        artFairAgreement: false,
                        copyNumber: copyNumber,
                        mediaCategory: workObj.category,
                        availableForSale: workObj.availableForSale,
                        artistId: workObj.artistUserId,
                        workId: workObj._id,
                        edition: data.edition,
                        copyForArtRent: data.copyForArtRent,
                        copyForExhibition: data.copyForExhibition,
                        ownerHistory: []
                    }).save(function (err) {
                            callback(err); //Only send error if there, not copy data
                        });
                }
            })(i));
        }

        for (var j = 1; j <= data.copiesOnMDisk; j++) {
            _tasks.push((function (copyNumber) {
                return function (callback) {
                    new WorkCopy({
                        currentOwnership: {
                            ownerId: workObj.artistUserId,
                            currency: workObj.currency,
                            price: workObj.pricePerWork,
                            ownerSinceTimeStamp: +new Date()
                        },
                        transferTo: {
                            active: false
                        },
                        publicKey: Utils.generateRandomKey(8),
                        copyTypeLFP: true,
                        artFairAgreement: false,
                        copyNumber: copyNumber,
                        mediaCategory: workObj.category,
                        availableForSale: workObj.availableForSale,
                        artistId: workObj.artistUserId,
                        workId: workObj._id,
                        edition: data.edition,
                        copyForArtRent: data.copyForArtRent,
                        copyForExhibition: data.copyForExhibition,
                        ownerHistory: []
                    }).save(function (err) {
                            callback(err); //Only send error if there, not copy data
                        });
                }
            })(i));
            i++;
        }
        async.parallelLimit(_tasks, 20, callback);
    });

    //Save Work
    tasks.push(function (callback) {
        workObj.save(callback);
    });

    //Run tasks
    async.series(tasks, function (err) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else {
            emitter.emit(EventName.DONE, workObj);
        }

    });
}.toEmitter();

exports.streamMediaFromBuffer = function (params) {
    var emitter = this;
    Work.findOne({_id: Utils.convertToObjectId(params.workId)}, function (err, work) {
        MediaStorageIndex.findOne({_id: work.mediaStorageIndexId}, function (err, workIndex) {
            mediaStorage.getOriginalMediaFileBuffer(workIndex._id, params.quality, function (buffer, name, contentType) {
                if (buffer) emitter.emit(EventName.DONE, buffer, name, contentType);
                else emitter.emit(EventName.NOT_FOUND);
            });
        });
    });
}.toEmitter();

exports.streamMediaFromLocalPath = function (params) {
    var emitter = this;
    Work.findOne({_id: Utils.convertToObjectId(params.workId)}, function (err, work) {
        log.trace(err, work);
        if (err) {
            emitter.emit(EventName.NOT_FOUND);
        }
        if (work) {
            MediaStorageIndex.findOne({_id: work.mediaStorageIndexId}, function (err, workIndex) {
                mediaStorage.getOriginalMediaFileLocalPath(workIndex._id, params.quality, function (path) {
                    log.info(path);
                    if (path) emitter.emit(EventName.DONE, path);
                    else emitter.emit(EventName.NOT_FOUND);
                });
            });
        }
    });
}.toEmitter();

exports.getSellAbleWorks = function (userId, mediaCategory, offSet, limit) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(userId);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", userId));
        return;
    }

    //Build query
    var query = {
        "currentOwnership.ownerId": userIdObj,
        "availableForSale": true,
        "transferTo.active": false
    };
    if (mediaCategory != 'all') query["mediaCategory"] = mediaCategory;

    //Get the list
    WorkCopy.aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: "$workId",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $skip: +(offSet || 0)
        },
        {
            $limit: +(limit || 0)
        }
    ], function (err, res) {
        log.trace(arguments);
        var tasks = [];
        res.forEach(function (workGroup) {
            tasks.push(function (callback) {
                Work.findOneAndPopulateCounts({_id: workGroup._id}, {}, function (err, work) {
                    if (err) callback(err);
                    else if (work) {
                        work = work.toObject && work.toObject() || work;
                        work.availableWithOwner = workGroup.count;
                        callback(null, work);
                    } else callback(new Error("No Work found for Work Copy!"));
                });
            });
        });
        async.parallelLimit(tasks, 10, function (err, res) {
            if (err) emitter.emit(EventName.ERROR, err);
            else emitter.emit(EventName.DONE, res || []);
        });
    });
}.toEmitter();

exports.fetchMediaThumbnail = function (workId) {
    var emitter = this;
    Work.findOne({_id: workId}, function (err, work) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else if (work && work.stillAnnotatedImage && work.stillAnnotatedImage.png) {
            emitter.emit(EventName.DONE, work.stillAnnotatedImage.png);
        } else if (work && work.category == 'Sound Art') {
            emitter.emit(EventName.DONE, path.join(__appBaseDir, '/web-app/img/user/audio_thumbnail.jpg'));
        } else {
            emitter.emit(EventName.DONE, path.join(__appBaseDir, '/web-app/img/user/thumbnail.png'));
        }
    })
}.toEmitter();

exports.fetchMediaThumbnailWithoutWatermark = function (workId) {
    var emitter = this;
    Work.findOne({_id: workId}, function (err, work) {
        if (err) {
            emitter.emit(EventName.ERROR);
        } else {
            log.trace(work);
            if (work && work.stillAnnotatedImageWithoutWatermark && work.stillAnnotatedImageWithoutWatermark.png) {
                log.trace(work.stillAnnotatedImageWithoutWatermark.png);
                emitter.emit(EventName.DONE, work.stillAnnotatedImageWithoutWatermark.png);
            }
            else {
                if (work && work.category == 'Sound Art') {
                    emitter.emit(EventName.DONE, __appBaseDir + '/web-app/img/user/audio_thumbnail.jpg');
                } else {
                    emitter.emit(EventName.DONE, __appBaseDir + '/web-app/img/user/thumbnail.png');
                }
            }
        }
    })
}.toEmitter();

exports.fetchMediaForStreaming = function (workId) {
    var emitter = this;
    Work.findOne({_id: workId}, function (err, work) {
        if (err) emitter.emit(EventName.ERROR, err);
        else if (work) {
            MediaStorageIndex.findOne({_id: work.mediaStorageIndexId}, function (err, media) {
                if (err) emitter.emit(EventName.ERROR, err);
                else if (media) {
                    if (work.category == 'Still Image') emitter.emit(EventName.DONE, media.filePath.image.original);
                    else if (work.category == 'Sound Art') emitter.emit(EventName.DONE, media.filePath.stream.mp3 || media.filePath.stream.original);
                    else if (work.category == 'Moving Image') emitter.emit(EventName.DONE, media.filePath.stream.lowMp4 || media.filePath.stream.original);
                } else emitter.emit(EventName.NOT_FOUND, new Error("Media not found for ID: " + work.mediaStorageIndexId));
            });
        } else emitter.emit(EventName.NOT_FOUND, new Error("Work not found for ID: " + workId));
    })
}.toEmitter();

exports.fetchContractPDF = function (workId, userId, workCopyId) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(userId);
    var workIdObj = Utils.convertToObjectId(workId);
    var workCopyIdObj = Utils.convertToObjectId(workCopyId);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", userId));
        return;
    }
    if (Boolean(workCopyId) && !workCopyIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid Work Copy ID: ", workCopyId));
        return;
    }
    if (!workIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid Work ID: ", workId));
        return;
    }

    if (workCopyIdObj) {
        //We are looking for a specified work copy.
        WorkCopy.findOne({_id: workCopyIdObj}, function (err, workCopy) {
            if (err) {
                emitter.emit(EventName.ERROR, err);
            } else if (workCopy) {
                log.trace(workCopy);
                createContractIfNotPresent(workCopy, function (err, workCopy) {
                    log.warn(workCopy);
                    if (err) emitter.emit(EventName.ERROR, err);
                    else emitter.emit(EventName.DONE, workCopy.currentOwnership.contractUrl);
                });
            } else emitter.emit(EventName.NOT_FOUND, new Error("No record found for Work Copy Id: " + workCopyId));
        });
    } else {
        //We are looking for a work copy of current user.
        WorkCopy.findOne({workId: workIdObj, "currentOwnership.ownerId": userIdObj}, function (err, workCopy) {
            if (err) {
                emitter.emit(EventName.ERROR, err);
            } else if (workCopy) {
                createContractIfNotPresent(workCopy, function (err, workCopy) {
                    log.warn(workCopy);
                    if (err) emitter.emit(EventName.ERROR, err);
                    else emitter.emit(EventName.DONE, workCopy.currentOwnership.contractUrl);
                });
            } else emitter.emit(EventName.NOT_FOUND, new Error("No record found of WorkCopy for Work:" + workId + ", User:" + userId));
        });
    }


    /**
     * @private create Contract if not present
     * */
    function createContractIfNotPresent(workCopy, callback) {
        if (workCopy.currentOwnership.contractUrl) {
            //Nothing to do here..
            callback(null, workCopy);
        } else {
            var _tasks = [],
                workObj, //
                pdfURL,
                invoice,
                seller,
                buyer,
                artist;//

            //Get the Work Domain
            _tasks.push(function (callback) {
                Work.findOne({_id: workCopy.workId}, function (err, work) {
                    if (err) callback(err);
                    else {
                        workObj = work;
                        callback();
                    }
                });
            });

            //Get the artist Information
            _tasks.push(function (callback) {
                User.findOne({_id: Utils.convertToObjectId(workObj.artistUserId)}, function (err, _artist) {
                    if (err) callback(err);
                    else {
                        artist = _artist;
                        callback();
                    }
                });
            });

            //Check if we need to actually build pdf, all deps met?
            _tasks.push(function (callback) {
                var build = false;
                if (workObj.stillAnnotatedImage && workObj.stillAnnotatedImage.png) {
                    build = true;
                }
                if (workObj.category == 'Sound Art') {
                    build = true;
                }
                if (build) callback();
                else callback(new Error("Contract not available as media is not ready yet"));
            });

            //Fetch Invoice
            _tasks.push(function (callback) {
                Invoice.findOne({_id: workCopy.currentOwnership.invoiceId}, function (err, _invoice) {
                    if (err) callback(err);
                    else if (_invoice) callback(null, invoice = _invoice);
                    else callback(new Error(" Invoice not Found! "));
                });
            });

            //Fetch Seller
            _tasks.push(function (callback) {
                User.findOne({_id: invoice.sellerId}, {'password': 0}, function (err, _user) {
                    if (err) callback(err);
                    else if (_user) callback(null, seller = _user);
                    else callback(new Error("Seller not found!"));
                });
            });

            //Fetch Buyer
            _tasks.push(function (callback) {
                User.findOne({_id: invoice.buyerId}, {'password': 0}, function (err, _user) {
                    if (err) callback(err);
                    else if (_user) callback(null, buyer = _user);
                    else callback(new Error("Buyer not found!"));
                });
            });

            //Build PDF
            _tasks.push(function (callback) {
                log.trace("Creating Contract PDF ");
                globalEvent.emit('OnGenerateContractPDF', seller, buyer, artist, workObj, workCopy, function (err, _url) {
                    if (err) callback(err);
                    else if (_url) callback(null, pdfURL = _url);
                    else callback(new Error("Unable to create the Contract PDF!"));
                });
            });

            //save and update workCopy
            _tasks.push(function (callback) {
                workCopy.currentOwnership.contractUrl = pdfURL;
                workCopy.save(function (err) {
                    if (err) callback(err);
                    else callback();
                });
            });

            //Do tasks
            async.series(_tasks, function (err) {
                if (err) callback(err);
                else callback(null, workCopy);
            });
        }
    }
}.toEmitter();

exports.fetchCoaPDF = function (workId, userId, workCopyId) {
    var emitter = this;

    //Convert userId to ObjectID type
    var userIdObj = Utils.convertToObjectId(userId);
    var workIdObj = Utils.convertToObjectId(workId);
    var workCopyIdObj = Utils.convertToObjectId(workCopyId);

    if (!userIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid User ID: ", userId));
        return;
    }
    if (Boolean(workCopyId) && !workCopyIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid Work Copy ID: ", workCopyId));
        return;
    }
    if (!workIdObj) {
        emitter.emit(EventName.ERROR, new Error("Invalid Work ID: ", workId));
        return;
    }

    if (workCopyIdObj) {
        //We are looking for a specified work copy.
        WorkCopy.findOne({_id: workCopyIdObj}, function (err, workCopy) {
            if (err) {
                emitter.emit(EventName.ERROR, err);
            } else if (workCopy) {
                createCOAIfNotPresent(workCopy, function (err, workCopy) {
                    log.warn(workCopy);
                    if (err) emitter.emit(EventName.ERROR, err);
                    else emitter.emit(EventName.DONE, workCopy.currentOwnership.coaUrl);
                });
            } else emitter.emit(EventName.NOT_FOUND, new Error("No record found for Work Copy Id: " + workCopyId));
        });
    } else {
        //We are looking for a work copy of current user.
        WorkCopy.findOne({workId: workIdObj, "currentOwnership.ownerId": userIdObj}, function (err, workCopy) {
            if (err) {
                emitter.emit(EventName.ERROR, err);
            } else if (workCopy) {
                createCOAIfNotPresent(workCopy, function (err, workCopy) {
                    if (err) emitter.emit(EventName.ERROR, err);
                    else emitter.emit(EventName.DONE, workCopy.currentOwnership.coaUrl);
                });
            } else emitter.emit(EventName.NOT_FOUND, new Error("No record found of WorkCopy for Work:" + workId + ", User:" + userId));
        });
    }

    /**
     * @private create COA if not present
     * */
    function createCOAIfNotPresent(workCopy, callback) {
        if (workCopy.currentOwnership.coaUrl) {
            //Nothing to do here..
            callback(null, workCopy);
        } else {
            var _tasks = [],
                workObj,
                coaURL;

            //Get the Work Domain
            _tasks.push(function (callback) {
                Work.findOne({_id: workCopy.workId}, function (err, work) {
                    if (err) callback(err);
                    else {
                        workObj = work;
                        callback();
                    }
                });
            });

            //Check if we need to actually build pdf, all deps met?
            _tasks.push(function (callback) {
                var build = false;
                if (workObj.stillAnnotatedImage && workObj.stillAnnotatedImage.png) {
                    build = true;
                }
                if (workObj.category == 'Sound Art') {
                    build = true;
                }
                if (build) callback();
                else callback(new Error("Certificate not available as media is not ready yet"));
            });

            //Build PDF
            _tasks.push(function (callback) {
                globalEvent.emit('OnGenerateCOA', workObj, workCopy, function (err, _url) {
                    coaURL = _url;
                    callback(err);
                });
            });

            //save and update workCopy
            _tasks.push(function (callback) {
                workCopy.currentOwnership.coaUrl = coaURL;
                workCopy.save(function (err) {
                    if (err) callback(err);
                    else callback();
                });
            });

            //Do tasks
            async.series(_tasks, function (err) {
                if (err) callback(err);
                else callback(null, workCopy);
            });
        }
    }
}.toEmitter();

exports.fetchPDFDocument = function (userId, type) {
    var emitter = this;
    User.findOne({_id: Utils.convertToObjectId(userId)}, function (err, user) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else if (Boolean(user)) {
            emitter.emit(EventName.DONE, user[type]);
        } else {
            emitter.emit(EventName.ERROR, new Error("Invalid Request. No Key for user: " + userId));
        }
    });
}.toEmitter();

exports.publicWork = function (publicKey) {

    var emitter = this;

    var tasks = [],
        workObj,
        artist,
        owner;

    //Get populated Work
    tasks.push(function (callback) {
        var _tasks = [], work, workCopy;
        _tasks.push(function (callback) {
            Work.findOneAndPopulateCounts({publicKey: publicKey}, {}, function (err, _work) {
                if (err) callback(err);
                else if (!_work) {
                    callback(new Error("Invalid id. Does not represent work or workCopy. " + publicKey));
                }
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
            WorkCopy.findOne({publicKey: publicKey}, function (err, _workCopy) {
                if (err) callback(err);
                else if (!_workCopy) {
                    callback(new Error("Invalid id. Does not represent work or workCopy. " + publicKey));
                }
                else {
                    workCopy = _workCopy;
                    Work.findOneAndPopulateCounts({_id: _workCopy.workId}, {}, function (err, _work) {
                        if (err) callback(err);
                        else if (_work) {
                            work = _work;
                            callback();
                        } else callback(new Error("Unable to fetch work."));
                    });
                }
            });
        });

        async.series(_tasks, function (err) {
            if (err) {
                callback(err);
            } else {
                workCopy && (work.workCopy = workCopy);
                callback(null, workObj = work);
            }
        });
    });

    //Get artist
    tasks.push(function (callback) {
        User.findOne({_id: workObj.artistUserId}, function (err, _artist) {
            if (err) callback(err);
            else if (_artist) {
                artist = _artist;
                callback();
            } else callback(new Error("Artist not found for id: " + workObj.artistUserId));
        });
    });

    //Get Owner
    tasks.push(function (callback) {
        if (!workObj.workCopy) {
            owner = artist;
            callback();
            return;
        }
        User.findOne({_id: workObj.workCopy.currentOwnership.ownerId}, function (err, _owner) {
            if (err) callback(err);
            else if (_owner) {
                owner = _owner;
                callback();
            } else callback(new Error("Owner not found for id: " + workObj.workCopy.currentOwnership.ownerId));
        });
    });

    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, workObj, artist, owner);
    });
}.toEmitter();

exports.showEmbedWork = function (workId) {
    var emitter = this;
    Work.findOne({_id: workId}, function (err, work) {
        if (err) emitter.emit(EventName.ERROR, err);
        else if (work && work.category != 'Still Image') emitter.emit(EventName.DONE, work);
        else if (work && work.category == 'Still Image') emitter.emit(EventName.DONE, work);
        else if (work && work.stillAnnotatedImage && work.stillAnnotatedImage.length) emitter.emit(EventName.DONE, work);
        else emitter.emit(EventName.NOT_FOUND);
    });
}.toEmitter();

exports.fetchMediaForEmbedWork = function (workId) {
    var emitter = this;
    Work.findOne({_id: workId}, {}, function (err, work) {
        if (err) emitter.emit(EventName.ERROR, err);
        else if (work) {
            MediaStorageIndex.findOne({_id: work.mediaStorageIndexId}, function (err, media) {
                if (err) emitter.emit(EventName.ERROR, err);
                else if (media) {
                    if (work.category == 'Still Image') emitter.emit(EventName.DONE, media.filePath.image.original);
                    else if (work.category == 'Sound Art') emitter.emit(EventName.DONE, media.filePath.stream.mp3 || media.filePath.stream.original);
                    else if (work.category == 'Moving Image') emitter.emit(EventName.DONE, media.filePath.stream.lowMp4 || media.filePath.stream.original);
                    else emitter.emit(EventName.ERROR, new Error("Unknown media."));
                } else emitter.emit(EventName.NOT_FOUND, new Error("Media not found for ID: " + work.mediaStorageIndexId));
            });
        } else emitter.emit(EventName.NOT_FOUND, new Error("Work not found for ID: " + workId));
    })
}.toEmitter();

/**
 * Transfer the work to buyer.
 * */
exports.transferOwnership = function (buyerEmail, workCopyId, artFairAgreement, lfpCopy, user) {
    var emitter = this;

    var tasks = [], work, workCopy, buyer, seller, transferKey;

    //Fetch the workcopy
    tasks.push(function (callback) {
        exports.getWorkCopyById(workCopyId)
            .on(EventName.ERROR, function (err) {
                callback(err);
            })
            .on(EventName.DONE, function (_workCopy) {
                workCopy = _workCopy;
                work = _workCopy.workInfo;
                callback();
            });
    });

    //Fetch workCopy linked object
    tasks.push(function (callback) {
        WorkCopy.findOne({_id: workCopy._id}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, workCopy = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch seller
    tasks.push(function (callback) {
        User.findOne({_id: Utils.convertToObjectId(user._id)}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                seller = user;
                callback();
            } else {
                callback(new Error("No seller found!"));
            }
        });
    });

    //Fetch buyer
    tasks.push(function (callback) {
        User.findOne({$or: [
            {"email.primary": buyerEmail},
            {"email.secondary": buyerEmail}
        ]}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                buyer = user;
                callback();
            } else {
                new User({
                    email: {primary: buyerEmail, secondary: buyerEmail},
                    firstName: null,
                    lastName: null,
                    password: null,
                    country: null,
                    zip: null,
                    roles: [require("../src/enum/Role").USER, require("../src/enum/Role").COLLECTOR],
                    created: +new Date(),
                    lastLogin: null,
                    address: null,
                    phone: {business: null, mobile: null},
                    work: [],
                    businessInfo: {company: null, businessUrl: null},
                    privateKey: null,
                    membershipType: ["free"],
                    virtual: true,
                    userState: UserStatus.ON_HOLD
                }).save(function (err, user) {
                        if (err) callback(err);
                        else if (user) {
                            buyer = user;
                            callback();
                        } else callback(new Error("Cannot create buyer!"));
                    });
            }
        });
    });

    //Bootstrap in case of free transfer
    tasks.push(function (callback) {
        //Is a free transfer then only bootstrap work copy
        if (workCopy.transferTo.active) {
            callback();
            return;
        }

        var _tasks = [], invoice;

        //Create Invoice
        _tasks.push(function (callback) {
            new Invoice({
                "paymentExecStatus": "COMPLETE",
                "priceForParticularWork": 0,
                "workId": work._id,
                "timeStamp": +new Date(),
                "buyerId": buyer._id,
                "sellerId": seller._id,
                "transferMedium": "Free Transfer"
            }).save(function (err, _invoice) {
                    if (err) callback(err);
                    else if (_invoice) callback(null, invoice = _invoice);
                    else callback(new Error("Invoice not created!"));
                });
        });

        //swap work copy number
        _tasks.push(function (callback) {
            var swapTasks = [], swapCopy;

            //Fetch swap copy
            swapTasks.push(function (callback) {
                WorkCopy.find({
                    "workId": Utils.convertToObjectId(work._id),
                    "currentOwnership.ownerId": Utils.convertToObjectId(seller._id),
                    "availableForSale": true,
                    "transferTo.active": false
                }).sort({copyNumber: 1}).limit(1).exec(function (err, workCopy) {
                        if (err) emitter.emit(EventName.ERROR, err);
                        else callback(null, workCopy.length && (swapCopy = workCopy[0]));
                    });
            });

            //do swap
            swapTasks.push(function (callback) {
                if (workCopy.copyNumber == swapCopy.copyNumber) {
                    callback();
                    return;
                }
                var tempCopyNumber = swapCopy.copyNumber;
                swapCopy.copyNumber = workCopy.copyNumber;
                workCopy.copyNumber = tempCopyNumber;
                swapCopy.save(callback);
            });

            //Save workCopy
            swapTasks.push(function (callback) {
                workCopy.save(callback);
            });

            async.series(swapTasks, callback);
        });

        //Update work copy
        _tasks.push(function (callback) {
            workCopy.transferTo = {
                active: true,
                unclaimed: false,
                buyerId: buyer._id,
                "buyerEmail": buyerEmail,
                currency: "USD",
                price: 0,
                invoiceId: invoice._id,
                paymentMode: "Free Transfer",
                artFairAgreement: artFairAgreement,
                copyTypeLFP: lfpCopy,
                transferInitiationTimeStamp: +new Date()
            };
            workCopy.save(callback);
        });

        async.series(_tasks, callback);
    });

    //Do transfer
    tasks.push(function (callback) {
        transferKey = Utils.generateRandomKey(8);
        workCopy.transferTo.unclaimed = true;
        workCopy.currentOwnership.transferKey = transferKey;
        workCopy.availableForSale = false;
        workCopy.transferTo.buyerId = buyer._id;
        workCopy.transferTo.buyerEmail = buyerEmail;
        workCopy.save(callback);
    });

    //Update Invoice completed
    tasks.push(function (callback) {
        Invoice.update({_id: workCopy.transferTo.invoiceId}, {$set: {"paymentExecStatus": "COMPLETE", "buyerId": buyer._id}}, callback);
    });

    //Send email notification
    tasks.push(function (callback) {
        try {
            var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/transferKeyMail.ejs', "utf8");
            var html = EJS.render(file, {'transferKey': transferKey, 'logoUrl': _config.serverUrl + "/img/logo_100px_black.png", 'work': work, workCopy: workCopy, homeURL: _config.serverUrl, loginURL: _config.serverUrl + "/auth/signIn", registerURL: _config.serverUrl + "/auth/signIn#signup"});
            globalEvent.emit("OnEmailNotification", {"emailId": buyerEmail, "subject": 'Transaction Key', "textMatter": html});
            callback();
        } catch (c) {
            callback(c);
        }
    });

    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, {transferKey: transferKey});
    });
}.toEmitter();

exports.claimOwnership = function (buyerPassword, key, user) {

    var emitter = this;

    var tasks = [],
        hashedTransferKey = (key.replace(/[^0-9a-zA-Z]+/g, '')),
        hashedBuyerPassword = buyerPassword,
        buyer,
        seller,
        work,
        workCopy;

    //Find workCopy with entered transfer Key
    tasks.push(function (callback) {
        WorkCopy.findOne({"currentOwnership.transferKey": hashedTransferKey}, function (err, _workCopy) {
            if (err) callback(err);
            else if (_workCopy) callback(null, workCopy = _workCopy);
            else callback(new Error("Invalid Hash key!"));
        });
    });

    //Fetch work
    tasks.push(function (callback) {
        Work.findOneAndPopulateCounts({_id: workCopy.workId}, {}, function (err, _work) {
            if (err) callback(err);
            else if (_work) callback(null, work = _work);
            else callback(new Error("No work found!"));
        });
    });

    //Fetch desired buyer
    tasks.push(function (callback) {
        User.findOne({_id: workCopy.transferTo.buyerId}, function (err, _buyer) {
            if (err) callback(err);
            else if (_buyer) callback(null, buyer = _buyer);
            else callback(new Error("No buyer found!"));
        });
    });

    //fetch desired seller
    tasks.push(function (callback) {
        User.findOne({_id: workCopy.currentOwnership.ownerId}, function (err, _seller) {
            if (err) callback(err);
            else if (_seller) callback(null, seller = _seller);
            else callback(new Error("No seller found!"));
        });
    });

    //Verify buyer
    tasks.push(function (callback) {
        if (user._id.toString() == buyer._id.toString() && buyer.password == hashedBuyerPassword) {
            callback();
        } else callback(new Error("Unable to verify buyer! Make sure you are the buyer of the artwork."));
    });

    //Do transfer
    tasks.push(function (callback) {
        workCopy.ownerHistory.push({
            ownerId: workCopy.currentOwnership.ownerId,
            currency: workCopy.currentOwnership.currency,
            price: workCopy.currentOwnership.price,
            invoiceId: workCopy.currentOwnership.invoiceId,
            contractUrl: workCopy.currentOwnership.contractUrl,
            coaUrl: workCopy.currentOwnership.coaUrl,
            transferKey: workCopy.currentOwnership.transferKey,
            paymentMode: workCopy.currentOwnership.paymentMode,
            ownerSinceTimeStamp: workCopy.currentOwnership.ownerSinceTimeStamp,
            ownerUntilTimeStamp: +new Date(),
            ownerClass: workCopy.currentOwnership.ownerClass,
            artFairAgreement: workCopy.artFairAgreement,
            copyTypeLFP: workCopy.copyTypeLFP
        });

        workCopy.copyTypeLFP = workCopy.transferTo.copyTypeLFP;
        workCopy.artFairAgreement = workCopy.transferTo.artFairAgreement;

        workCopy.currentOwnership = {
            ownerId: workCopy.transferTo.buyerId,
            currency: workCopy.transferTo.currency,
            price: workCopy.transferTo.price,
            invoiceId: workCopy.transferTo.invoiceId,
            contractUrl: null,
            transferKey: " ",
            paymentMode: workCopy.transferTo.paymentMode,
            ownerSinceTimeStamp: +new Date(),
            ownerClass: OwnerClassType.BUYER
        };

        workCopy.transferTo.active = false;
        workCopy.transferTo.unclaimed = false;
        workCopy.availableForSale = true;

        workCopy.save(callback);

    });

    //generate contract
    tasks.push(function (callback) {
        exports.fetchContractPDF(work._id, buyer._id, workCopy._id, seller._id)
            .on(EventName.ERROR, function (err) {
                callback();
            })
            .on(EventName.NOT_FOUND, function (err) {
                callback(err);
            })
            .on(EventName.DONE, function () {
                callback();
            });
    });

    //Fetch and verify Coa
    tasks.push(function (callback) {
        exports.fetchCoaPDF(work._id, buyer._id, workCopy._id)
            .on(EventName.ERROR, function (err) {
                callback();
            })
            .on(EventName.NOT_FOUND, function (err) {
                callback(err);
            })
            .on(EventName.DONE, function () {
                callback()
            });
    });

    async.series(tasks, function (err) {
        if (err) {
            emitter.emit(EventName.ERROR, err);
        } else {
            work = work.toObject && work.toObject() || work || {};
            work.workCopy = workCopy;
            globalEvent.emit("OnWorkClaimed", seller, buyer, work, workCopy);
            emitter.emit(EventName.DONE, work);
        }
    });

}.toEmitter();

exports.validateTransferKey = function (email, key) {
    var emitter = this;
    WorkCopy.findOne({"currentOwnership.transferKey": key}, function (err, workCopy) {
        if (err) emitter.emit(EventName.ERROR, err);
        if (workCopy) emitter.emit(EventName.DONE, workCopy);
        else emitter.emit(EventName.NOT_FOUND, []);
    });
}.toEmitter();

/**
 * Initiate the transfer workflow
 * */
exports.initiateTransfer = function (data, user) {

    var workId = Utils.convertToObjectId(data.workId),
        buyerEmail = data.buyerEmail,
        sellerId = Utils.convertToObjectId(user._id),
        isArtFairAgreementEnabled = !!data.artFairAgreement,
        isLFP = !!data.copyTypeLFP,
        price = data.currentPrice || 0,
        workCopyId = Utils.convertToObjectId(data.workCopyId),
        bankDetails = data.bankDetails,
        paymentOption = data.paymentOption;

    var emitter = this;

    //Error check the ids
    if (!workId) {
        emitter.emit(EventName.ERROR, new Error("Invalid Work ID: " + data.workId));
        return;
    }
    if (!sellerId) {
        emitter.emit(EventName.ERROR, new Error("Invalid Seller ID: " + user._id));
        return;
    }
    if (!workCopyId) {
        emitter.emit(EventName.ERROR, new Error("Invalid WorkCopy ID: " + data.workCopyId));
        return;
    }

    //async tasks
    var tasks = [], work, workCopy, seller, buyer, invoice;

    //Fetch workCopy linked object
    tasks.push(function (callback) {
        WorkCopy.findOne({_id: workCopyId}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, workCopy = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch work linked object
    tasks.push(function (callback) {
        Work.findOne({_id: workId}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, work = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch seller
    tasks.push(function (callback) {
        User.findOne({_id: sellerId}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                seller = user;
                callback();
            } else {
                callback(new Error("No seller found!"));
            }
        });
    });

    //Fetch buyer
    tasks.push(function (callback) {
        User.findOne({$or: [
            {"email.primary": buyerEmail},
            {"email.secondary": buyerEmail}
        ]}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                buyer = user;
                callback();
            } else {
                new User({
                    email: {primary: buyerEmail, secondary: buyerEmail},
                    firstName: null,
                    lastName: null,
                    password: null,
                    country: null,
                    zip: null,
                    roles: [require("../src/enum/Role").USER, require("../src/enum/Role").COLLECTOR],
                    created: +new Date(),
                    lastLogin: null,
                    address: null,
                    phone: {business: null, mobile: null},
                    work: [],
                    businessInfo: {company: null, businessUrl: null},
                    privateKey: null,
                    membershipType: ["free"],
                    virtual: true,
                    userState: UserStatus.ON_HOLD
                }).save(function (err, user) {
                        if (err) callback(err);
                        else if (user) {
                            buyer = user;
                            callback();
                        } else callback(new Error("Cannot create buyer!"));
                    });
            }
        });
    });

    //Create Invoice
    tasks.push(function (callback) {
        new Invoice({
            "paymentExecStatus": "BANK TRANSFER",
            "priceForParticularWork": price,
            "workId": work._id,
            "timeStamp": +new Date(),
            "buyerId": buyer._id,
            "sellerId": seller._id,
            "transferMedium": paymentOption,
            "bankDetails": bankDetails || "N/A"
        }).save(function (err, _invoice) {
                if (err) callback(err);
                else if (_invoice) callback(null, invoice = _invoice);
                else callback(new Error("Invoice not created!"));
            });
    });

    //swap work copy number
    tasks.push(function (callback) {
        var swapTasks = [], swapCopy;

        //Fetch swap copy
        swapTasks.push(function (callback) {
            WorkCopy.find({
                "workId": Utils.convertToObjectId(work._id),
                "currentOwnership.ownerId": Utils.convertToObjectId(seller._id),
                "availableForSale": true,
                "transferTo.active": false
            }).sort({copyNumber: 1}).limit(1).exec(function (err, workCopy) {
                    if (err) emitter.emit(EventName.ERROR, err);
                    else callback(null, workCopy.length && (swapCopy = workCopy[0]));
                });
        });

        //do swap
        swapTasks.push(function (callback) {
            if (workCopy.copyNumber == swapCopy.copyNumber) {
                callback();
                return;
            }
            var tempCopyNumber = swapCopy.copyNumber;
            swapCopy.copyNumber = workCopy.copyNumber;
            workCopy.copyNumber = tempCopyNumber;
            swapCopy.save(callback);
        });

        //Save workCopy
        swapTasks.push(function (callback) {
            workCopy.save(callback);
        });

        async.series(swapTasks, callback);
    });

    //Update work copy
    tasks.push(function (callback) {
        workCopy.transferTo = {
            active: true,
            unclaimed: false,
            buyerId: buyer._id,
            "buyerEmail": buyerEmail,
            currency: work.currency,
            price: price,
            invoiceId: invoice._id,
            paymentMode: paymentOption,
            artFairAgreement: isArtFairAgreementEnabled,
            copyTypeLFP: isLFP,
            transferInitiationTimeStamp: +new Date()
        };
        workCopy.save(callback);
    });

    //Send email for bank transfer
    tasks.push(function (callback) {
        if (paymentOption.search(/bank/i) == -1) {
            callback();
            return;
        }
        var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/bankPaymentMail.ejs', "utf8");
        var html = EJS.render(file, {
            work: work,
            invoice: invoice,
            workCopy: workCopy,
            seller: seller,
            buyer: buyer,
            logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
            homeURL: _config.serverUrl
        });
        globalEvent.emit("OnEmailNotification", {"emailId": buyerEmail, "subject": 'ArtLock Bank Transaction', "textMatter": html});
        callback();
    });

    //handle paypal
    tasks.push(function (callback) {
        if (paymentOption.search(/paypal/i) == -1) {
            callback();
            return;
        }
        var options = {
            "method": "POST",
            "url": _config.paypal.url,
            "headers": {
                "X-PAYPAL-SECURITY-USERID": _config.paypal["X-PAYPAL-SECURITY-USERID"],
                "X-PAYPAL-SECURITY-PASSWORD": _config.paypal["X-PAYPAL-SECURITY-PASSWORD"],
                "X-PAYPAL-SECURITY-SIGNATURE": _config.paypal["X-PAYPAL-SECURITY-SIGNATURE"],
                "X-PAYPAL-REQUEST-DATA-FORMAT": "JSON",
                "X-PAYPAL-RESPONSE-DATA-FORMAT": "JSON",
                "X-PAYPAL-APPLICATION-ID": _config.paypal["X-PAYPAL-APPLICATION-ID"],
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "returnUrl": _config.serverUrl + "/user/dashboard#/works/reserved",
                "senderEmail": _config.paypal.senderEmail,
                "requestEnvelope": {
                    "errorLanguage": "en_US"
                },
                "currencyCode": work.currency.toUpperCase(),
                "receiverList": {
                    "receiver": [
                        {
                            "email": seller.email.primary,
                            "amount": invoice.priceForParticularWork
                        }
                    ]
                },
                "cancelUrl": _config.serverUrl + "/user/dashboard#/transfer-work-step1/",
                "actionType": "PAY"
            })
        };
        request(options, function (error, response) {
            if (error) {
                callback(error);
                return;
            }
            var body = response.body;
            var payResponse = JSON.parse(body);
            if (!payResponse.error) {
                var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/paypalPaymentMail.ejs', "utf8");
                var html = EJS.render(file, {
                    work: work,
                    invoice: invoice,
                    workCopy: workCopy,
                    seller: seller,
                    buyer: buyer,
                    logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
                    homeURL: _config.serverUrl,
                    paypalLink: "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=" + payResponse.payKey
                });
                globalEvent.emit("OnEmailNotification", {"emailId": buyerEmail, "subject": 'ArtLock Transaction', "textMatter": html});
                workCopy.transferTo.paypalPayKey = payResponse.payKey;
                workCopy.save(callback);
            } else {
                log.trace(payResponse.error[0].message);
                callback(new Error(payResponse.error[0].message));
            }
        });
    });

    //Execute tasks
    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, invoice);
    });

}.toEmitter();

exports.resendPaymentInfo = function (workCopyId, currentUser) {
    var emitter = this;

    var tasks = [], workCopy, invoice, seller, buyer, work;

    //Fetch workCopy linked object
    tasks.push(function (callback) {
        WorkCopy.findOne({_id: Utils.convertToObjectId(workCopyId)}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, workCopy = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch work linked object
    tasks.push(function (callback) {
        Work.findOne({_id: workCopy.workId}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, work = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch seller
    tasks.push(function (callback) {
        User.findOne({_id: Utils.convertToObjectId(currentUser._id)}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                seller = user;
                callback();
            } else {
                callback(new Error("No seller found!"));
            }
        });
    });

    //Fetch buyer
    tasks.push(function (callback) {
        User.findOne({_id: workCopy.transferTo.buyerId}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                buyer = user;
                callback();
            } else {
                callback(new Error("No buyer found!"));
            }
        });
    });

    //Fetch invoice
    tasks.push(function (callback) {
        Invoice.findOne({_id: workCopy.transferTo.invoiceId}, function (err, _invoice) {
            if (err) callback(err);
            else if (_invoice) {
                invoice = _invoice;
                callback();
            } else {
                callback(new Error("No Invoice found!"));
            }
        });
    });

    //Send email for bank transfer
    tasks.push(function (callback) {
        if (workCopy.transferTo.paymentMode.search(/bank/i) == -1) {
            callback();
            return;
        }
        var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/bankPaymentMail.ejs', "utf8");
        var html = EJS.render(file, {
            work: work,
            invoice: invoice,
            workCopy: workCopy,
            seller: seller,
            buyer: buyer,
            logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
            homeURL: _config.serverUrl
        });
        globalEvent.emit("OnEmailNotification", {"emailId": buyer.email.primary, "subject": 'ArtLock Bank Transaction', "textMatter": html});
        callback();
    });

    //handle paypal
    tasks.push(function (callback) {
        if (workCopy.transferTo.paymentMode.search(/paypal/i) == -1) {
            callback();
            return;
        }
        var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/paypalPaymentMail.ejs', "utf8");
        var html = EJS.render(file, {
            work: work,
            invoice: invoice,
            workCopy: workCopy,
            seller: seller,
            buyer: buyer,
            logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
            homeURL: _config.serverUrl,
            paypalLink: "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=" + workCopy.transferTo.paypalPayKey
        });
        globalEvent.emit("OnEmailNotification", {"emailId": buyer.email.primary, "subject": 'ArtLock Transaction', "textMatter": html});
        callback();
    });

    //save history
    tasks.push(function (callback) {
        workCopy.transferTo.reminderMailsHistory.push({
            email: buyer.email.primary,
            timeStamp: +new Date()
        });
        workCopy.save(callback);
    });

    //Execute tasks
    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, workCopy);
    });
}.toEmitter();

exports.removeReservedWork = function (workCopyId, currentUser) {
    var emitter = this;

    var tasks = [], workCopy;

    //Fetch workCopy linked object
    tasks.push(function (callback) {
        WorkCopy.findOne({_id: Utils.convertToObjectId(workCopyId)}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, workCopy = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Release work copy
    tasks.push(function (callback) {
        workCopy.transferTo.active = false;
        workCopy.transferTo.unclaimed = false;
        workCopy.availableForSale = true;
        workCopy.save(callback);
    });

    //Execute tasks
    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE, workCopy);
    });
}.toEmitter();

exports.resendTransferKey = function (workCopyId, currentUser) {
    var emitter = this;

    var tasks = [], work, workCopy, buyer;

    //Fetch workCopy
    tasks.push(function (callback) {
        WorkCopy.findOne({_id: Utils.convertToObjectId(workCopyId)}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, workCopy = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch work
    tasks.push(function (callback) {
        Work.findOne({_id: workCopy.workId}, function (err, wc) {
            if (err) callback(err);
            else if (wc) callback(null, work = wc);
            else callback(new Error("No work copy found!"));
        })
    });

    //Fetch buyer
    tasks.push(function (callback) {
        User.findOne({_id: workCopy.transferTo.buyerId}, function (err, user) {
            if (err) callback(err);
            else if (user) {
                buyer = user;
                callback();
            } else {
                callback(new Error("No buyer found!"));
            }
        });
    });

    //send mail
    tasks.push(function (callback) {
        try {
            var file = fs.readFileSync(__appBaseDir + '/web-app/views/mailTemplates/transferKeyMail.ejs', "utf8");
            var html = EJS.render(file, {
                transferKey: workCopy.currentOwnership.transferKey,
                logoUrl: _config.serverUrl + "/img/logo_100px_black.png",
                work: work,
                workCopy: workCopy,
                homeURL: _config.serverUrl,
                loginURL: _config.serverUrl + "/auth/signIn",
                registerURL: _config.serverUrl + "/auth/signIn#signup"
            });
            globalEvent.emit("OnEmailNotification", {"emailId": buyer.email.primary, "subject": 'Transaction Key', "textMatter": html});
            callback();
        } catch (c) {
            callback(c);
        }
    });

    async.series(tasks, function (err) {
        if (err) emitter.emit(EventName.ERROR, err);
        else emitter.emit(EventName.DONE);
    });
}.toEmitter();
