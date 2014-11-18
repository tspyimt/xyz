/**
 *
 * Model Market
 * This model defines the schema of the Market Domain.
 *
 * This collection is intended to store the list of site created by users.
 * */

/*
 * Define the Schema of the collection (MongooseJS schema definition)
 * */
exports.schema = {
    userId: String,
    sites: {
    	name: String,
    	works: Array,
    },
    created: Date
};
