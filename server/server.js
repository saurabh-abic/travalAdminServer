'use strict';
const path = require('path');

const loopback = require('loopback');
const boot = require('loopback-boot');
var { initRedis } = require('../common/helper/RedisHelper')

const http = require('http');
//const https = require('https');
//const sslConfig = require('./ssl-config');

const app = module.exports = loopback();
initRedis();

// boot scripts mount components like REST API
boot(app, __dirname, function (err) {
    if (err) throw err;

    //start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

app.use(loopback.token({
    model: app.models.accessToken
}));

process.on('uncaughtException', function (error) {
    console.log(new Date(), "##########uncaughtException", error);
    //errorManagement.handler.handleError(error);
    //if (!errorManagement.handler.isTrustedError(error))
    //    process.exit(1)
});

process.on('unhandledRejection', function (reason, p) {
    //call handler here
    console.log(new Date(), "##########unhandledRejection", reason, p);
})

app.start = function (httpOnly) {
    //if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
    //}
    let server = null;
    //if (!httpOnly) {
    //    const options = {
    //        key: sslConfig.privateKey,
    //        cert: sslConfig.certificate,
    //    };
    //    server = https.createServer(options, app);
    //} else {
    server = http.createServer(app);
    //}

    server.listen(app.get('port'), function () {
        const baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
        app.emit('started', baseUrl);
        console.log('LoopBack server listening @ %s%s', baseUrl, '/');

        app.use(loopback.static(path.resolve(__dirname, '../upload')));

        if (app.get('loopback-component-explorer')) {
            const explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
    server.timeout = 300000;
    return server;
};