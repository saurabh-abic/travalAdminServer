const axios = require('axios');
const https = require('https');
const { queries } = require('../utils/queries');
const bodyParser = require('body-parser');
const utils = require('../../common/helper/Utils');
const config = require('../config.json');
const constants = require('../../common/helper/Constants');
const mergeFiles = require('merge-files');
const { randomTxt } = require('../../common/helper/Utils');
const chunkSize = 1048576 * 3;
var fs = require('fs');
const { STORAGE_ROOT } = require('../config.json')
const TEMP_PATH = STORAGE_ROOT + "Temp\\";

const axiosinstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

module.exports = function (app) {
    var router = app.loopback.Router();

    app.post('/UploadChunks', bodyParser.raw({ limit: "50mb", type: '*/*' }), function (req, res, next) {
        if (!fs.existsSync(TEMP_PATH)) {
            fs.mkdirSync(TEMP_PATH);
        }
        let newpath = TEMP_PATH + req.query.fileName + req.query.id;
        fs.writeFile(newpath, req.body, {
            encoding: "utf8",
            flag: "w",
            mode: 0o666
        }, function (err) {
            if (err) throw err;
            return res.send({
                isSuccess: true,
                message: "Chunk uploaded."
            });
        });
    });

    app.post('/UploadComplete', function (req, res, next) {
        const filename = req.query.fileName;// + '_' + new Date().getTime() + randomTxt(4);
        const outputPath = STORAGE_ROOT + 'uptake-ctscans/' + filename;
        let count = parseInt(req.query.count);
        const inputPathList = [];
        for (let i = 1; i <= count; i++) {
            inputPathList.push(TEMP_PATH + '/' + req.query.fileName + i);
        }

        try {
            mergeFiles(inputPathList, outputPath).then((status) => {
                // delete files once done
                inputPathList.map((p) => {
                    fs.unlink(p, (err) => {
                        if (err) throw err;
                    });
                });

                return res.send({
                    isSuccess: true,
                    message: "File uploaded.",
                    fileName: outputPath
                });
            });
        } catch (e) {
            return res.send({
                success: false,
                message: "Invalid file provided"
            });
        }
    });

    app.post('/login', function (req, res) {
        app.models.Userdata.login({
            email: req.query.email,
            password: req.query.password,
            active: 1,
            ttl: constants.accessTokenTTL
        }, 'user', function (err, token) {
            if (err) {
                delete err.stack;

                if (err.hasOwnProperty('code') && err.code === "LOGIN_FAILED") {
                    app.models.Userdata.findOne({ where: { email: req.query.email, active: 1 } }, (e, _u) => {
                        if (e || !_u) {
                            return res.send({
                                data: {
                                    status: "Failed To Login",
                                    message: "Invalid username or password provided.",
                                    code: constants.LOGIN_FAILED
                                }
                            });
                        }

                        const { passwordfailureattempts, failedloginat, id: userid } = _u.__data,
                            maxAttemptsReached = (passwordfailureattempts + 1) >= constants.maxPasswordFailureAttempts;

                        // check whether the user credentials are blocked
                        // if (maxAttemptsReached) {
                        //     const diffResult = utils.differenceInMinutesFromDates(failedloginat, new Date()),
                        //         diffInSeconds = Math.ceil(utils.convertDiffInSeconds(diffResult));
                        //
                        //     // block is still active
                        //     if (diffInSeconds < (constants.credentialsBlockedFor * 60 * 60)) {
                        //
                        //         // should we destroy token to revoke concurrent sessions after credentails are blocked?
                        //
                        //         return res.send({
                        //             data: constants.CREDENTIALS_LOCKED('Your account is locked for next 30 minutes because of wrong password entry')
                        //         });
                        //     }
                        // } else {
                            // wrong credentials provided
                            _u.updateAttributes({ passwordfailureattempts: passwordfailureattempts + 1, failedloginat: new Date() }, (error, opt) => {
                                if (error || !opt) {
                                    return res.send({
                                        data: {
                                            status: "failure",
                                            message: "Error while login, try again."
                                        }
                                    });
                                }

                                // const { passwordfailureattempts: attempts } = opt.__data;
                                //
                                // let attemptsLeft = constants.maxPasswordFailureAttempts - attempts;
                                return res.send({
                                    data: constants.INVALID_PASSWORD(`Invalid username or password provided.`),
                                });
                            });
                        // }
                    });
                }

                return;
            }

            if (!constants.twoFactorAuthEnabled) {
                return res.send({
                    data: {
                        status: "failure",
                        message: "Two factor authentication is disabled"
                    }
                });
            }

            // TODO: credentials once blocked must not be unblocked until serves the full locked duration
            const refreshToken = req.param('token') ? req.param('token') : null,
                user = { ...token.__data.user.__data },
                { id: userId } = user;
            //     accountLocked = isAccountLocked(user, constants.maxPasswordFailureAttempts, constants.credentialsBlockedFor);
            //
            // if (accountLocked) {
            //     return res.send({ data: constants.CREDENTIALS_LOCKED('Your account is locked for next 30 minutes because of wrong password entry') });
            // }

            // if (refreshToken && refreshToken.length) {
            //     const { lastloggedinat } = user;
            //
            //     // user must be logged in without otp verification flow
            //     app.models.Otprefreshtoken.findOne({ where: { id: refreshToken } }, (_err1, d) => {
            //
            //         if (_err1 || !d || userId !== d.__data.userid) {
            //             return sendOtp(token, res, userId);
            //         }
            //
            //         const { userid, id: tokenId } = d.__data;
            //
            //         // token matches against the user
            //         app.models.AccessToken.findOne({ where: { userId: userid } }, (tErr, aToken) => {
            //             if (tErr || !aToken) {
            //                 return res.send({ data: constants.ACCESS_TOKEN_NOT_FOUND() });
            //             }
            //
            //             const { id: aTokenId, userId: _uid, ttl } = aToken.__data,
            //                 diffRes = utils.differenceInMinutesFromDates(lastloggedinat, new Date()),
            //                 diffInSec = Math.ceil(utils.convertDiffInSeconds(diffRes));
            //
            //             token.__data.user.updateAttributes({ passwordfailureattempts: 0 }, (e2, _user) => {
            //                 const { email, firstname, lastname, role, username, phonenumber, id: uId } = _user.__data;
            //                 return res.send({
            //                     data: { id: uId, email, firstname, lastname, role, username, phonenumber, token: aTokenId, verified: true }
            //                 });
            //             });
            //         });
            //     });
            // }
            // else {
                // user have to go through the whole original flow of login
                sendToken(token, res, userId);
            // }
        });
    });

    /**
     * Checks whether the account is blocked because of wrong password entries
     * @param {object} userdata - user model instance
     * @param {int} maxattemptsallowed - max password attempts allowed
     * @param {int} lockedTime - max time limit account must be blocked for
     * @returns {boolean}
     */
    const isAccountLocked = function (userdata, maxattemptsallowed, lockedTime) {
        const { passwordfailureattempts, failedloginat } = userdata,
            attemptsExhausted = passwordfailureattempts + 1 >= maxattemptsallowed,
            diffResult = utils.differenceInMinutesFromDates(failedloginat, new Date()),
            diffInSeconds = Math.ceil(utils.convertDiffInSeconds(diffResult)),
            blockStillActive = attemptsExhausted && (diffInSeconds < (lockedTime * 60 * 60));

        return blockStillActive;
    };

    function sendToken(token, res, userId) {
        console.log("userId: ",userId);
        token.__data.user.updateAttributes({ passwordfailureattempts: 0 }, (e2, _user) => {

            const { email, firstname, lastname, role, username, phonenumber, id: uId } = _user.__data;
            return res.send({
                data: { id: uId, email, firstname, lastname, role, username, phonenumber, accessToken: token.id }
            });

            // app.models.AccessToken.create({
            //     id: utils.randomTxt(64),
            //     userId: userId,
            //     ttl: constants.accessTokenTTL,
            //     active: 1
            // }, (err, data) => {
            //     if (err) {
            //         return res.send({
            //             data: {
            //                 status: "failure",
            //                 message: "refresh token could not be updated",
            //                 code: constants.TOKEN_NOT_UPDATED
            //             }
            //         });
            //     }
            // });
        });
    }

    router.post('/executeQuery', function (req, res) {
        let queryname = req.query['queryname'];
        let param0 = req.query['param0'];
        let param1 = req.query['param1'];
        let param2 = req.query['param2'];
        let param3 = req.query['param3'];
        let param4 = req.query['param4'];
        let param5 = req.query['param5'];
        let param6 = req.query['param6'];
        let param7 = req.query['param7'];
        let graphqlQuery = queries[queryname];

        let variables = null;
        if (graphqlQuery.variables) {
            param0 = (!param0) ? '0' : param0;
            variables = graphqlQuery.variables.replace('{{0}}', param0)
                .replace('{{1}}', param1)
                .replace('{{2}}', param2)
                .replace('{{3}}', param3)
                .replace('{{4}}', param4)
                .replace('{{5}}', param5)
                .replace('{{6}}', param6)
                .replace('{{7}}', param7);
        }
        // Execute graphqlQuery and return the response
        axiosinstance({
            method: 'post',
            url: 'http://localhost:9443/graphql',
            data: { "query": graphqlQuery.query, "variables": variables, "operationName": null }
        })
            .then(axiosres => {
                return res.send(axiosres.data);
            })
            .catch(error => {
                return res.send(error.response.data);
            });
    });

    router.get('/logout', function (req, res) {
        app.models.Userdata.logout(req.query['access_token'], () => {
            return res.send({ status: 'Success' });
        });
    });


    // app.use('/payment', bodyParser.text(), (req, res, next) => {
    //     try {
    //         let paymentId = req.query.razorpay_payment_id;
    //         let orderId = req.query.razorpay_order_id;
    //         let signature = req.query.razorpay_signature;

    //         var hash = crypto.createHmac('SHA256', config.RAZOR_PAY_KEY_SECRET).update(orderId + "|" + paymentId).digest('hex');
    //         if (hash !== signature) {
    //             throw new Error('Signature dosen\'t match');
    //         }

    //         app.models.Order.find({ where: { razororderid: orderId }}, (err, orders) => {

    //             return request(
    //                 {
    //                     method: "POST",
    //                     url: `https://${config.RAZOR_PAY_KEY_ID}:${config.RAZOR_PAY_KEY_SECRET}@api.razorpay.com/v1/payments/${paymentId}/capture`,
    //                     form: {
    //                         amount: orders[0].orderamount * 100,
    //                         currency: "INR",
    //                     }
    //                 },
    //                 async function (err, response, body) {
    //                     if (err) {
    //                         return res.send({ status: 'Failure' });
    //                     }

    //                     let rpRes = JSON.parse(body);
    //                     app.models.Payment.create({
    //                         paymentid: rpRes.id,
    //                         amount: rpRes.amount,
    //                         currency: rpRes.currency,
    //                         razororderid: rpRes.order_id,
    //                         orderid: orders[0].id,
    //                         paymentstatus: rpRes.status,
    //                         method: rpRes.method,
    //                         captured: rpRes.captured,
    //                         bank: rpRes.bank,
    //                         errorcode: rpRes.error_code,
    //                         errordescription: rpRes.error_description,
    //                         rawresponse: body,
    //                         transactiondate: new Date(rpRes.created_at * 1000)
    //                     });

    //                     if (rpRes.captured == true) {
    //                         app.models.Order.updateAll({ id: orders[0].id }, { orderstatus: 'PAYMENTSUCCESS' });
    //                         app.models.Cart.updateAll({ active: 1, userid: orders[0].orderedby }, { active: 0 });
    //                         return res.send({ status: 'Success', orderId: orders[0].id });
    //                     } else {
    //                         app.models.Order.updateAll({ id: orders[0].id }, { orderstatus: 'PAYMENTFAILURE' });
    //                         return res.send({ status: 'Failure', orderId: orders[0].id });
    //                     }

    //                 });
    //         });
    //     } catch (err) {
    //         return res.send({ status: 'Failure' });
    //     }
    // });

    app.use(router);
};
