/*
 * Defines the User Roles.
 *
 * */
exports = module.exports = {

    /*
     * There is only one super admin bootstraped by default.
     *
     * The things the Super Admin can do is:
     * 1) Create Admin Users
     * 2) Create Normal Users
     * 3) Delete Other Admin Users or Normal Users
     * 4) Update Other Admin Users or Normal Users
     * 5) Access API
     * */
    SUPER_ADMIN: "super admin",

    /*
     * There can be many admin users created on the fly using API by consumer application with access to Super User credentials.
     *
     * The things the Admin can do is:
     * 1) Create Normal Users
     * 2) Delete Myself or Other Normal Users
     * 3) Update Myself or Other Normal Users
     * 4) Access API
     * */
    ADMIN: "admin",

    /*
     * There can be many normal users created on the fly using API by consumer application which is admin user.
     *
     * The things the User can do is:
     * 1) Delete Myself
     * 2) Update Myself
     * 3) Access API
     * */
    USER: "user",

    ARTIST: "artist",

    ARTIST_REPRESENTATIVE : "artist representative",

    COLLECTOR : "collector",

    CURATOR :"curator",

    ART_ENTHUSIAST :"art enthusiast"

};

/**
 * Helper method to compress the role array for transfers in token
 *
 * @param {Array} rolesArray Array defining the roles.
 *
 * @return {String} a short string defining the roles
 * */
exports.toShortNotation = function (rolesArray) {
    var shortCodes = [];
    rolesArray.forEach(function (role) {
        switch (role) {
            case exports.SUPER_ADMIN:
                shortCodes.push(0);
                break;
            case exports.ADMIN:
                shortCodes.push(1);
                break;
            case exports.USER:
                shortCodes.push(2);
                break;
            case exports.ARTIST:
                shortCodes.push(3);
                break;
            case exports.ARTIST_REPRESENTATIVE:
                shortCodes.push(4);
                break;
            case exports.COLLECTOR:
                shortCodes.push(5);
                break;
            case exports.ART_ENTHUSIAST:
                shortCodes.push(6);
                break;
        }
    });
    return shortCodes.join("|");
};

/**
 * Helper method to decompress the role array from short code
 *
 * @param {String} shortCode The short code strong.
 *
 * @return {Array} an Array defining the roles
 * */
exports.fromShortNotationToRolesArray = function (shortCode) {
    var roles = [];
    shortCode.split("|").forEach(function (code) {
        switch (parseInt(code, 10)) {
            case 0:
                roles.push(exports.SUPER_ADMIN);
                break;
            case 1:
                roles.push(exports.ADMIN);
                break;
            case 2:
                roles.push(exports.USER);
                break;
            case 3:
                roles.push(exports.ARTIST);
                break;
            case 4:
                roles.push(exports.ARTIST_REPRESENTATIVE);
                break;
            case 5:
                roles.push(exports.COLLECTOR);
                break;
            case 6:
                roles.push(exports.ART_ENTHUSIAST);
                break;
        }
    });
    return roles;
};