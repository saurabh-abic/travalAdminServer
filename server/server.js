'use strict';
const path = require('path');

// --------------------------------------------------------
const bodyParser = require('body-parser')
const cors = require('cors');
var crypto = require('crypto');

// --------------------------------------------------------

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

app.use(bodyParser.json())
app.use(cors())
app.get('/checkout', function(req, res){
    console.log("Get Checkout hit");

})

app.post('/checkout',async (req, res)=>{
    console.log("POST Checkout hit");
console.log(req.body)

var key = "OYL5tj9T";
var salt = "XXCo8YibBv";
var txnid = "4TYD21M7";
var amount = 10;
var productinfo = req.body.productinfo;
var firstname = req.body.firstname;
var email = req.body.email;


const udf1="", udf2="",udf3="", udf4="", udf5="", udf6="",udf7="", udf8="",udf9="", udf10 = '';

var text = key+'|'+txnid+'|'+amount+'|'+productinfo+'|'+firstname+'|'+email+'|||||'+udf5+'||||||'+salt;

var cryp = crypto.createHash('sha512');
cryp.update(text);
var hash = cryp.digest('hex');

console.log(hash);

res.json({
    hash: hash,
    key: key,
    salt: salt,
    txnid: txnid,
    amount: amount,
    productinfo: req.body.productinfo,
    firstname: req.body.firstname,
    email: req.body.email,
    phone: req.body.phone,
    surl: 'http://localhost:8443/checkout',
    furl: 'http://localhost:8443/checkout',
    service_provider: 'payu_paisa'
})
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