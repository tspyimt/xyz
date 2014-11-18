
/**
 *
 * Model Playlist
 * This model defines the schema of the Playlist Domain.
 *
 * This collection is intended to store the list of playlists created by users.
 * */

/*
 * Define the Schema of the collection (MongooseJS schema definition)
 * */
exports.schema = {
    userId: String,
    title: String,
    works: Array,
    created: Date
};
