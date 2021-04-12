const redis = require("redis");

const host = 'localhost';
const redisGetTimeout = 100; // ms
const expiryTime = 3600; //seconds
const enableRedis = false;

const initRedis = () => {
    if (!enableRedis)
        return;
    global.redisClient = redis.createClient({ host: host, port: 6379 });

    global.redisClient.auth('', function (err, reply) {
        console.log(err);
    });

    global.global.redisClient.on("error", function (error) {
        console.error(error);
    });
}

const redisGet = (key, callback) => { //look ma, no explicit arguments
    if (!enableRedis)
        return callback(null, null);
    var argsAsArr = [key, callback],
        cb = argsAsArr.pop(),
        //we'll hold the reference to the timeout in this variable
        timeoutHandler;

    //after the timeLimit, throw an error
    timeoutHandler = setTimeout(function () {
        cb(new Error('Redis timed out'));
        //make cb a no-op to prevent double callback
        cb = function () { };
    }, redisGetTimeout);

    //since we've pop'ed off the original cb - let's add in our own replacement callback
    argsAsArr.push(function (err, values) {
        //disable the original timeout
        clearTimeout(timeoutHandler);
        //call back as normal
        cb(err, JSON.parse(values));
    });

    //send the original arguments, with the replaced callback
    global.redisClient['get'].apply(global.redisClient, argsAsArr);
};

const redisSet = (key, val, t = expiryTime) => {
    if (!enableRedis)
        return;
    global.redisClient.setex(key, t, JSON.stringify(val))
}

const redisDel = (key) => {
    if (!enableRedis)
        return callback(null, null);
    global.redisClient.del(key);
}

module.exports = {
    initRedis,
    redisGet,
    redisSet,
    redisDel
}