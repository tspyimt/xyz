/**
 * Created by intelligrape on 31/7/14.
 */

var EventName = require("../src/enum/EventName");
exports.sendSubscribeMail = function (req, res) {
    OtherServices.sendSubscribeMail(req.body)
        .on(EventName.ERROR, function (err) {
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403)
        })
        .on(EventName.DONE, function (data) {
            res.sendSuccessAPIResponse("Your request to participate in the ARTLOCK Beta is received. We will contact you soon.");
        });
};
exports.sendContactMail = function (req, res) {
    OtherServices.sendContactMail(req.body)
        .on(EventName.ERROR, function (err) {
            res.sendErrorAPIResponse(err);
        })
        .on(EventName.NOT_FOUND, function (err) {
            res.sendErrorAPIResponse(err, 403)
        })
        .on(EventName.DONE, function (data) {
            res.sendSuccessAPIResponse("We will reply to your message as soon as possible.");
        });
};