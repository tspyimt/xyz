/**
 * Editor Controller
 *
 * Handles the routes responsible for working with editor
 *
 * */

//Include dependencies
var EventName = require("../src/enum/EventName");

/**
 * Handles the route which renders the console with a script.
 * @url "/script/:id"
 * */
exports.console = function (req, res) {
    ConsoleDataService.getData(req.param("id"))
        .on(EventName.ERROR, function (err) {
            log.error(err);
            res.redirect('/'); //Todo in future show an error page here with a button to go back.
        })
        .on(EventName.NOT_FOUND, function () {
            res.redirect('/');
        })
        .on(EventName.DONE, function (scriptData, id) {
            res.render("console", {id: id, data: scriptData});
        });
};

//Todo remove this, this is sample controller. This is how to write.