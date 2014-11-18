/**
 *
 * Model Work
 * This model defines the schema of the Work Domain.
 *
 * This collection is intended to store the list of Works created by users.
 * */

//
var async = require("async");
var OwnerClassType = require("../src/enum/OwnerClassType");
/*
 * Define the Schema of the collection (MongooseJS schema definition)
 * */
exports.schema = {
    artistUserId: String,
    artistName: String,
    title: String,
    material: String,
    description: String,
    year: Number,
    category: String,
    edition: Number,
    copiesOnMDisk: Number,
    mediaStorageIndexId: String,
    copyForArtRent: Number,
    copyForExhibition: Number,
    pricePerWork: Number,
    currency: String,
    status: Boolean,
    created: Date,
    availableForSale: Boolean,
    stillAnnotatedImage: {
        png: {},
        original: {}
    },
    stillAnnotatedImageWithoutWatermark: {
        png: {}
    },
    offerIn: Boolean,
    metadata: {},
    publicKey: String,
    publicListing: Boolean
};

//Methods
exports.methods = {
    getCopyCounts: function (callback) {
        var tasks = [], work = this;

        //total in db
        tasks.push(function (callback) {
            WorkCopy.count({workId: work._id}, callback);
        });

        //Number sold mDisk
        tasks.push(function (callback) {
            WorkCopy.count({workId: work._id, copyTypeLFP: true, "currentOwnership.ownerClass": OwnerClassType.BUYER }, callback);
        });

        //Number sold edition
        tasks.push(function (callback) {
            WorkCopy.count({workId: work._id, copyTypeLFP: false, "currentOwnership.ownerClass": OwnerClassType.BUYER }, callback);
        });

        //Number locked
        tasks.push(function (callback) {
            WorkCopy.count({workId: work._id, "transferTo.active": true, "transferTo.unclaimed": false }, callback);
        });

        //Number unClaimed
        tasks.push(function (callback) {
            WorkCopy.count({workId: work._id, "transferTo.active": true, "transferTo.unclaimed": true }, callback);
        });

        //total Number of times sold TODO test
        tasks.push(function (callback) {
            WorkCopy.aggregate([
                {
                    $match: {
                        workId: work._id
                    }
                },
                {$project: {workId: 1, 'ownerHistory.ownerId': 1}},
                {
                    $unwind: "$ownerHistory"
                },
                {
                    $group: {
                        _id: '$workId',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ], function (err, res) {
                log.trace(arguments);
                callback(err, res && res[0] && res[0].count || 0);
            });
        });

        async.parallel(tasks, function (err, counts) {
            if (err) callback(err);
            else {
                var totalCopies = counts[0] || 0,
                    mDiskCopiesSold = counts[1] || 0,
                    editionsSold = counts[2] || 0,
                    totalLocked = counts[3] || 0,
                    totalUnclaimed = counts[4] || 0,
                    totalTimesSold = counts[5] || 0,
                    mDiskCopiesAvailable = (work.copiesOnMDisk || 0) - mDiskCopiesSold,
                    editionsAvailable = (work.edition || 0) - (work.copiesOnMDisk || 0) - editionsSold;
                callback(null, totalCopies, mDiskCopiesSold, editionsSold, totalLocked, totalUnclaimed, mDiskCopiesAvailable, editionsAvailable, totalTimesSold)
            }
        });
    }
};

exports.static = {
    findOneAndPopulateCounts: function (query, projection, callback) {
        Work.findOne(query, projection, function (err, work) {
            if (err) callback(err);
            else if (work) {
                work.getCopyCounts(function (err, totalCopies, mDiskCopiesSold, editionsSold, totalLocked, totalUnclaimed, mDiskCopiesAvailable, editionsAvailable, totalTimesSold) {
                    if (err) callback(err);
                    else {
                        var _work = work.toObject();
                        _work.counts = {
                            totalCopies: totalCopies,
                            mDiskCopiesSold: mDiskCopiesSold,
                            editionsSold: editionsSold,
                            totalLocked: totalLocked,
                            totalUnclaimed: totalUnclaimed,
                            mDiskCopiesAvailable: mDiskCopiesAvailable,
                            editionsAvailable: editionsAvailable,
                            totalSold: mDiskCopiesSold + editionsSold,
                            copiesAvailable: (mDiskCopiesAvailable + editionsAvailable) - (totalLocked + totalUnclaimed),
                            copiesSoldInTotal: totalTimesSold
                        };
                        callback(null, _work);
                    }
                });
            } else callback(null, work);
        });
    },
    findAndPopulateCounts: function (query, projection, callback) {
        Work.find(query, projection, function (err, works) {
            if (err) callback(err);
            else {
                var tasks = [];
                works.forEach(function (work) {
                    tasks.push(function (callback) {
                        work.getCopyCounts(function (err, totalCopies, mDiskCopiesSold, editionsSold, totalLocked, totalUnclaimed, mDiskCopiesAvailable, editionsAvailable, totalTimesSold) {
                            if (err) callback(err);
                            else {
                                var _work = work.toObject();
                                _work.counts = {
                                    totalCopies: totalCopies,
                                    mDiskCopiesSold: mDiskCopiesSold,
                                    editionsSold: editionsSold,
                                    totalLocked: totalLocked,
                                    totalUnclaimed: totalUnclaimed,
                                    mDiskCopiesAvailable: mDiskCopiesAvailable,
                                    editionsAvailable: editionsAvailable,
                                    totalSold: mDiskCopiesSold + editionsSold,
                                    copiesAvailable: (mDiskCopiesAvailable + editionsAvailable) - (totalLocked + totalUnclaimed),
                                    copiesSoldInTotal: totalTimesSold
                                };
                                callback(null, _work);
                            }
                        });
                    });
                });
                async.parallelLimit(tasks, 20, callback);
            }
        });
    }
};

