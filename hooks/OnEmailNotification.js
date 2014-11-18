/**
 * Created by vibhor on 28/3/14.
 */
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport('SMTP', {
    service: _config.email.service,
    auth: {
        user: _config.email.auth.user,
        pass: _config.email.auth.pass
    }
});


exports.onEvent = function (data) {
    log.info(data);

    var message = {
        from: _config.email.auth.user,
        to: data.emailId, //can be an array of email ids
        subject: data.subject,
        cc: data.cc || [],
        bcc: data.bcc || [],
        html: data.textMatter
    };

    transport.sendMail(message, function (error) {
        if (error) {
            log.info(error);
            return;
        }
        log.info('Email has been sent to: ' + data.emailId);
    });
};
