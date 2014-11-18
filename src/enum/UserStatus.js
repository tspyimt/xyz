/**
 * Created by vibhor on 2/4/14.
 */
exports = module.exports = {

    ON_HOLD : "on hold",
    PENDING_EMAIL_CONFIRMATION : "pending email confirmation",
    PENDING_BASIC_PROFILE : "pending basic profile",
    PENDING_COMPLETE_PROFILE : "pending complete profile",
    PENDING_APPROVAL: "pending approval",
    FEATURED_MEMBER :"featured member",
    PENDING_VERIFIED_MEMBER : "pending verified member",
    VERIFIED_MEMBER : "verified member"

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
        }
    });
    return roles;
};