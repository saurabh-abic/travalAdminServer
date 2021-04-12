const app = require('../../server/server');
const constants = require('./Constants');
const AWS = require('aws-sdk');

AWS.config.update({
    credentials: new AWS.Credentials("AKIA6EEH7MAU34RX3U5L", "BE3RRl+aTc0i8kSuF9tAlok3LLhNVZF50zRAO0luxXci"),
    region: "us-west-2"
});

//const fcm = new FCM(serverKey);

const sendSESMail = (to, subject, content, cc = [], attachment = []) => {
    if (to instanceof Array && to.length){
        const htmlContent = constants.EMAIL_LAYOUT_STD.replace('{{ content }}', content);
        const mailParams = {
            Destination: {
                ToAddresses: to // Email address/addresses that you want to send your email
            },
            ConfigurationSetName: "email-smtp.us-west-1.amazonaws.com",
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlContent
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject
                }
            },
            Source: "no-reply@elevatedroi.com"
        };

        const sendEmail = ses.sendEmail(mailParams).promise();

        sendEmail.then(data => {
            console.log("email submitted to SES", data);
        }).catch(error => {
            console.log(error);
        });
    }
}

const sendEmail = (to, subject, content, cc = [], attachment = [], model) => {
    return new Promise((resolve, reject) => {
        const executeMailer = () => {
            const htmlContent = constants.EMAIL_LAYOUT_STD.replace('{{ content }}', content);

            let data = {
                to: to,
                from: "no-reply@elevatedroi.com",
                subject: subject,
                html: htmlContent
            };
            console.log("DATA: ",data);

            if (cc && cc.length) data.cc = cc;
            if (attachment && attachment.length) data.attachments = attachment;

            app.models.Email.send(data, function (err, mail) {
                if (err || !mail) console.log("ERROR:  ",err);

                console.log("MAIL: ",mail);

                console.log("email sent successfully")
                return { status: "success", message: 'Email sent successfully' };
            });
        };

        if (to instanceof Array && to.length) return resolve(executeMailer());
        else {
            app.models.Userdata.find({ where: { or: [{ username: to }, { email: to }, { altEmail: to }] } }, (err, u) => {
                if (err || !u.length) return resolve(false);

                return resolve(executeMailer());
            });
        }
    });
}

const getFormatted = (sub, msg, options) => {
    return {
        subject: formattedMessage(sub, options),
        message: formattedMessage(msg, options)
    };
}
const formattedMessage = (
    message,
    options
) => {
    if (!message) return '';

    const { firstname, lastname, email, password } = options

    return message
        .replace('{{firstname}}', firstname)
        .replace('{{lastname}}', lastname)
        .replace('{{password}}', password)
        .replace('{{email}}', email)
};

module.exports = {getFormatted, sendEmail, sendSESMail}
