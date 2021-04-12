const app = require('../../server/server');
const { ACCOUNT_SID, AUTH_TOKEN, SMS_FROM } = require('../../server/config.json')
//const FCM = require('fcm-node');
const serverKey = require('../helper/privatekey.json');
const constants = require('./Constants');

//const fcm = new FCM(serverKey);

const sendSms = (destinationNumber, message) => {
    const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

    return new Promise((resolve, reject) => {
        client.messages
            .create({
                body: message,
                from: SMS_FROM,
                to: destinationNumber,
            })
            .then(msg => {
                console.log(msg.sid);
                app.models.Notificationhistory.create({
                    message,
                    notificationtype: 'SMS',
                    phoneno: destinationNumber,
                });

                return resolve({ success: true, message: 'SMS sent successfully' });
            })
            .catch(e => {
                console.error(e);
                return resolve({ success: false, error: e });
            });
    });
}

const sendEmail = (to, subject, content, cc = [], attachment = []) => {
    return new Promise((resolve, reject) => {
        const executeMailer = () => {
            const htmlContent = constants.EMAIL_LAYOUT_STD.replace('{{ content }}', content);

            let data = {
                to: to,
                from: '',
                subject: subject,
                html: htmlContent
            };

            if (cc && cc.length) data.cc = cc;
            if (attachment && attachment.length) data.attachments = attachment;

            app.models.Email.send(data, function (err, mail) {
                if (err || !mail) console.log(err);

                app.models.Notificationhistory.create({
                    subject,
                    message: content,
                    notificationtype: 'EMAIL',
                    from: '',
                    emailid: to
                });

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

const sendPushNotification = (userid, title, body) => {
    app.models.Registerdevice.find({
        where: { userid: userid },
        fields: { id: true, userid: true, deviceid: true, token: true }
    }).then(device => {
        app.models.Usernotification.create({ userid: userid, notification: title, notificationbody: body });
        device.forEach(obj => {
            var message = {
                to: obj.token,
                notification: {
                    title: title,
                    body: body
                },

                // data: {  //you can send only notification or only data(or include both)
                //     my_key: 'my value',
                //     my_another_key: 'my another value'
                // }
            }

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!")
                } else {
                    console.log("Successfully sent with response: ", JSON.stringify(response))
                }
            })
        });
    })
}

module.exports = {
    sendSms,
    sendEmail,
    sendPushNotification
};
