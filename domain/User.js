/**
 *
 * Model User
 * This model defines the schema of the User Domain.
 *
 * This collection is intended to store the list of Users.
 * */

/*
 * Define the Schema of the collection (MongooseJS schema definition)
 * */
exports.schema = {
    email: {type: Object},
    firstName: String,
    lastName: String,
    password: String,
    country: String,
    state: String,
    city: String,
    streetNumber: Number,
    address: String,
    zip: Number,
    roles: Array,
    created: Date,
    lastLogin: Number,
    phone: {business: Number, mobile: Number},
    work: Array,
    businessInfo: {type: Object},
    membershipType: Array,
    creatorKey: String,
    privateKey: String,
    tradeKey: String,
    userState: String,
    emailTimeStamp: Number,
    passwordTimeStamp: Number,
    hashPrivateKey: String,
    hashCreatorKey: String,
    hashTradeKey: String,
    avatar: String,
    hideName: {type: Boolean, default: false},
    virtual: {type: Boolean, default: false},
    blocked: {type: Boolean, default: false},
    identificationVideoURL: String
};

/*
 * Define some static methods
 * */
exports.static = {
    /**
     * Static method on this domain to get a paginated list of workers.
     *
     * @param {Number} skip The offset to pass.
     * @param {Number} limit Total number of records wanted
     * @param {Function} callback The callback method, arguments(err, workers, total)
     *
     * */
    ListPaginated: function (skip, limit, callback) {
        var Model = this;
        Model.count(function (err, total) {
            if (err) callback(err);
            else {
                var query = Model.find().skip(skip);
                if (limit > 0) query.limit(limit);
                query.exec(function (err, workers) {
                    if (err) callback(err);
                    else callback(null, workers, total);
                });
            }
        });
    }
};