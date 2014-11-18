/**
 *
 * Model WorkCopy
 * This model defines the schema of the WorkCopy Domain.
 *
 * This collection is intended to store the list of Work copies created.
 * */

//Import ObjectID schema
var ObjectId = require('mongoose').Schema.ObjectId;
var OwnerClassType = require("../src/enum/OwnerClassType");

/*
 * Define the Schema of the collection (MongooseJS schema definition)
 * */
exports.schema = {

    //CurrentOwnerShip Info
    currentOwnership: {
        ownerId: ObjectId,
        currency: String,
        price: Number,
        invoiceId: ObjectId,
        contractUrl: String,
        coaUrl: String,
        transferKey: String,
        paymentMode: String,
        ownerSinceTimeStamp: Number,
        ownerClass: {type: String, required: true, default: OwnerClassType.CREATOR}
    },

    //Initiated transfer Info, filled in case of active transfer
    transferTo: {
        active: {type: Boolean, default: false},
        unclaimed: {type: Boolean, default: false},
        buyerId: ObjectId,
        buyerEmail:String,
        currency: String,
        price: Number,
        invoiceId: ObjectId,
        paymentMode: String,
        paypalPayKey: String,
        artFairAgreement: Boolean,
        copyTypeLFP: Boolean,
        reminderMailsHistory: {type: Array, default: []},
        transferInitiationTimeStamp: Number
    },

    //Work public key
    publicKey: String,

    //Copy Info
    copyTypeLFP: Boolean,
    artFairAgreement: Boolean,
    copyNumber: Number,
    mediaCategory: String,
    availableForSale: Boolean,

    //CACHED here from Work to enhance read performance, Edition info
    edition: Number,
    copyForArtRent: Number,
    copyForExhibition: Number,

    //Artist who created it
    artistId: ObjectId,

    //The Work the copy correspond to
    workId: ObjectId,

    //Store the buyer history
    ownerHistory: [
        {
            ownerId: ObjectId,
            currency: String,
            price: Number,
            invoiceId: ObjectId,
            contractUrl: String,
            coaUrl: String,
            transferKey: String,
            paymentMode: String,
            ownerSinceTimeStamp: Number,
            ownerUntilTimeStamp: Number,
            ownerClass: String,
            artFairAgreement: Boolean,
            copyTypeLFP: Boolean
        }
    ]
};

