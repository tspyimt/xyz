/*
 * Loading Modules
 * */
var async = require("async"),
    spawn = require('child_process').spawn;


/*
 * This is the start point for BootStrap. This method is triggered externally from app.js when the instance is loaded.
 * This is only called once when the instance spins up.
 * */
exports.init = function () {
    log.info("Executing Bootstrap");

    log.info("Executing Jobs");

    switch (__appEnv) {
        case "development":
            bootstrapForDevelopment();
            break;
        case "test":
            bootstrapForTest();
            break;
        case "production":
            bootstrapForProduction();
            break;
        case "qa":
            bootstrapForQa();
            break;
        default:
            log.info("No Bootstrap for the Environment:", __appEnv);
    }

    //Database sanatization
    (function dataMigrationForUpdates() {
        User.update({ blocked: {$exists: false}}, {$set: {blocked: false}}, {multi: true, upsert: false}, function (err, count) {
            if (err) log.error(err);
            else log.debug("Added blocked:false to old users, NUM:", count);
        });
    })();

    String.prototype.printAndReturnSelf = function () {
        console.log("PRINTING THE STRING".bold.red);
        console.log("Value:".bold.yellow, this.toString().magenta);
        console.log("-----------------------------------");
        return this.toString();
    };
};

/*
 * Bootstrap execution for the env "development"
 * */
function bootstrapForDevelopment() {
    var tasks = [];

    //Define the tasks in order of execution
    tasks.push(createSuperAdminUserIfDoesNotExist);
    tasks.push(checkUserTempDirectory);

    async.series(tasks, function () {
        log.info("Finished executing Bootstrap for 'development'");
    });
}

/*
 * Bootstrap execution for the env "production"
 * */
function bootstrapForProduction() {
    var tasks = [];

    //Define the tasks in order of execution
    tasks.push(createSuperAdminUserIfDoesNotExist);
    tasks.push(checkUserTempDirectory);

    async.series(tasks, function () {
        log.info("Finished executing Bootstrap for 'production'");
    });
}

/*
 * Bootstrap execution for the env "test"
 * */
function bootstrapForTest() {
    var tasks = [];

    //Define the tasks in order of execution
    tasks.push(createSuperAdminUserIfDoesNotExist);
    tasks.push(checkUserTempDirectory);

    async.series(tasks, function () {
        log.info("Finished executing Bootstrap for 'test'");
    });
}

/*
 * Bootstrap execution for the env "qa"
 * */
function bootstrapForQa() {
    var tasks = [];

    //Define the tasks in order of execution
    tasks.push(createSuperAdminUserIfDoesNotExist);
    tasks.push(checkUserTempDirectory);

    async.series(tasks, function () {
        log.info("Finished executing Bootstrap for 'qa'");
    });
}


/***********************************************************************************************
 *
 * Individual task methods are described below.
 *
 ***********************************************************************************************/

/*
 * Create A super admin user if does not exist.
 * */
function createSuperAdminUserIfDoesNotExist(callback) {
    User.findOne({"email.primary": "artlock@artlock.com"}, function (err, user) {
        if (err) log.error(err);
        else if (Boolean(user)) callback();
        else {
            var adminUser = {
                email: {primary: "artlock@artlock.com", secondary: "test@artlock.com"},
                firstName: "Admin",
                lastName: "Artlock",
                password: "admin",
                country: "India",
                zip: "11001",
                roles: [require("../src/enum/Role").ADMIN, require("../src/enum/Role").USER],
                created: +new Date(),
                lastLogin: null,
                address: "Delhi",
                "phone": {"business": "9876543210", "mobile": null},
                work: [],
                businessInfo: {companyNumber: null, company: "artlock"},
                privateKey: "qwerty12345",
                membershipType: ["free"]
            };
            var userId = "53e892de686470f833000002";
            User.update({_id: userId}, {$set: adminUser}, {upsert: true}, function (err, updated) {
                    if (err) {
                        log.error(err);
                        callback(err);
                    } else {
                        adminUser._id = userId;
                        log.info("Admin User created  :  ", adminUser);
                    }
                }
            )
        }
    });
}

function checkUserTempDirectory(callback) {
    var _process = spawn('ls', [_config.mediaStorage.storageBaseDir]);
    _process.stderr.on('data', function (data) {
        log.error("Error :", data.toString() + " Please create directory " + _config.mediaStorage.storageBaseDir + " and change permission to current user");
        if (data) {
            throw new Error(data.toString() + " Please create directory " + _config.mediaStorage.storageBaseDir);
        }
    });
    callback();
}
