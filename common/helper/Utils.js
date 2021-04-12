let moment = require('moment');
var crypto = require('crypto');
var { algorithm, password } = require('./Constants');
var algorithm = 'aes-256-ctr';
var password = 'WdKCYbP1qST9yXjX9XyOwSCMPUnec8JbuNVryC7A';
const fs = require('fs');
const path = require('path');
const { STORAGE_ROOT } = require('../../server/config.json');
const { region, accessKeyId, secretAccessKey } = require('./awsconfig.json');
const AWS = require('aws-sdk');

AWS.config.update({ region, accessKeyId, secretAccessKey });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const generateOtp = () => {
    let otpLength = 4;
    let OTP = '';

    //logic for generating OTP
    for (let i = 0; i < otpLength; i++) {
        OTP = OTP + Math.floor(Math.random() * 10).toString();
    }
    return parseInt(OTP);
}

const textLimit = {
    smsLength: 140,
    callLength: 400,
}

const randomTxt = (length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const toTime = (dt) => {
    let h = dt.getHours();
    let m = dt.getMinutes();
    let n = 'AM';
    if (h >= 12) {
        if (h > 12)
            h = h - 12;
        n = 'PM';
    }
    return twoDigit(h) + ":" + twoDigit(m) + " " + n;
}

const toSimpleTime = (dt) => {
    return twoDigit(dt.getHours()) + ":" + twoDigit(dt.getMinutes()) + ":00";
}

const twoDigit = (d) => {
    return (d < 10) ? '0' + d : d;
}

const getDifference = (d1, d2) => {
    return (d1.getTime() - d2.getTime()) / 60000;
}

const minutesFormatter = (t) => {
    let d = parseInt(t / (60 * 12));
    let h = parseInt((t - (d * 60 * 12)) / 60);
    let m = parseInt(t - ((d * 60 * 12) + h * 60));
    let str = "";
    if (d != 0)
        str = d + " days ";
    if (h != 0) {
        if (h > 1)
            str += h + " hours ";
        else
            str += h + " hour ";
    }
    if (m != 0)
        str += m + " minutes";
    return str;
}

const getDay = (d) => {
    switch (d.day()) {
        case 0:
            return 'SUN';
        case 1:
            return 'MON';
        case 2:
            return 'TUE';
        case 3:
            return 'WED';
        case 4:
            return 'THU';
        case 5:
            return 'FRI';
        case 6:
            return 'SAT';
    }
}

/**
 * Returns -1 for less than start time, 1 for greater than end time. 0 for between start and end time
 * @param {any} dt
 * @param {any} startTime
 * @param {any} endTime
 */
const timeInBetween = (dt, startTime, endTime) => {
    let t = getTimeInMinutesFromDate(dt);
    let t1 = strTimeToMin(startTime);
    let t2 = strTimeToMin(endTime);

    if (t1 == t2)
        return 0;

    if (t < t1) {
        return -1;
    }
    else if (t > t2) {
        return 1;
    }
    else return 0;
    //return (t >= t1 && t <= t2);
}

const getTimeInMinutesFromDate = (dt) => {
    let str = dt.toISOString().substring(dt.toISOString().indexOf('T') + 1);
    let s = str.split(':');
    return parseInt(s[0]) * 60 + parseInt(s[1]);
}

const strTimeToMin = (str) => {
    let s = str.split(':');
    return parseInt(s[0]) * 60 + parseInt(s[1]);
}

const minToStr = (mins, isMilitary) => {
    let h = parseInt(mins / 60);
    let m = mins - h * 60;
    if (isMilitary)
        return twoDigit(h) + ":" + twoDigit(m) + ":00";
    else {
        let n = 'AM';
        if (h >= 12) {
            if (h > 12)
                h = h - 12;
            n = 'PM';
        }
        return twoDigit(h) + ":" + twoDigit(m) + " " + n;
    }
}

const parseToDate = (dt, timestr) => {
    let parsedDate = new Date(dt.getTime());
    let from = strTimeToMin(timestr);
    let h = parseInt(from / 60);
    parsedDate.setHours(h);
    parsedDate.setMinutes(from - h * 60);
    parsedDate.setSeconds(0);
    parsedDate.setMilliseconds(0);
    return parsedDate;
}

// a and b are javascript Date objects
const dateDiffInDays = (a, b) => {
    // Discard the time and time-zone information.
    let adt = a.toISOString().substring(0, a.toISOString().indexOf('T')).split('-');
    let bdt = b.toISOString().substring(0, b.toISOString().indexOf('T')).split('-');

    return getDOY(parseInt(bdt[0]), parseInt(bdt[1]), parseInt(bdt[2])) - getDOY(parseInt(adt[0]), parseInt(adt[1]), parseInt(adt[2]));
}

const isLeapYear = (y) => {
    let year = y;
    if ((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
}

const getForattedDate = (date) => {
    let m = date.getMonth() + 1;
    let d = date.getDate();
    return (date.getYear() + 1900) + '-' + twoDigit(m) + '-' + twoDigit(d);
}

// Get Day of Year
const getDOY = (y, m, d) => {
    let dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let mn = m;
    let dn = d;
    let dayOfYear = dayCount[mn] + dn;
    if (mn > 1 && isLeapYear(y)) dayOfYear++;
    return dayOfYear;
}

const isblank = (str) => {
    return (!str || str.trim() == '');
}

const notNullString = (str) => {
    if (isblank(str))
        return '';

    return str.trim();
}

const isSameTimeTillMinutes = (end) => {

    var now = moment(new Date()).format('HH:mm');
    var end = moment(new Date(end)).format('HH:mm');

    if (now.toString() === end.toString()) {
        return true;
    }
    return false;
}

const differenceInMinutesFromDates = (startDate, endDate) => {
    var ms = moment(endDate, "DD/MM/YYYY HH:mm:ss").diff(moment(startDate, "DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);

    return d._data;
}

const capitalizeFirstLetter = ([first, ...rest]) => {
    return [first.toUpperCase(), ...rest].join('');
}

const formatIP = (ip) => {
    if (!ip)
        return '';
    let s = ip.split(':');
    if (s.length > 0)
        return s[s.length - 1]

    return ip
}

const stringCompare = (a, b) => {
    a = notNullString(a);
    b = notNullString(b);

    return (a == b);
}

const dateToString = (d) => {
    if (!d)
        return '';

    return twoDigit(d.getMonth() + 1) + "/" + twoDigit(d.getDate()) + "/" + (d.getYear() + 1900) + ' ' + toTime(d);
}

const isSlotInRange = (fromTimeMin, toTimeMin, slotFromMin, slotToMin) => {
    if ((slotFromMin >= fromTimeMin && slotFromMin < toTimeMin) ||
        (slotToMin > fromTimeMin && slotToMin <= toTimeMin) ||
        (slotFromMin <= fromTimeMin && slotToMin >= toTimeMin)) {
        return true;
    }

    return false;
}

const isSlotInRange1 = (fromTimeMin, toTimeMin, slotFromMin, slotToMin) => {
    if ((slotFromMin >= fromTimeMin && slotFromMin < toTimeMin) ||
        (slotToMin > fromTimeMin && slotToMin <= toTimeMin) ||
        (slotFromMin <= fromTimeMin && slotToMin >= toTimeMin)) {
        return true;
    }

    return false;
}

const encrypt = (text) => {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;

}

const decrypt = (text) => {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

//dd/mm/yyyy format
const dateFormat = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [day, month, year].join('/');
}

const getAge = (DOB) => {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const convertDiffInSeconds = (diffobj) => {
    const { years, months, days, hours, minutes, seconds, milliseconds } = diffobj;

    let totalSeconds = 0;

    if (years) {
        let yrs = 60 * 60 * 24 * 365 * years;
        totalSeconds += yrs;
    }

    if (months) {
        let mnth = 60 * 60 * 24 * 30 * months;
        totalSeconds += mnth;
    }

    if (days) {
        let d = 60 * 60 * 24 * days;
        totalSeconds += d;
    }

    if (hours) {
        let hrs = 60 * 60 * hours;
        totalSeconds += hrs;
    }

    if (minutes) {
        let min = 60 * minutes;
        totalSeconds += min;
    }

    if (seconds) {
        totalSeconds += seconds;
    }

    if (milliseconds) {
        let millisec = milliseconds/1000;
        totalSeconds += millisec;
    }

    return totalSeconds;
}

const deleteRecord = (ctx, sql, params = [], cb) => {
    if (!ctx || !queryString) return {};

    const ds = ctx.dataSource;

    return new Promise((resolve, reject) => {
        ds.connector.execute(sql, params, (err, data) => {
            return resolve(cb(err, data));
        });
    });
}

/**
 * Generates alpha numeric password with the length of 10
 * @returns {string}
 */
const generatePassword = () => Math.random().toString(36).slice(-10);

const pad = (num, size) => {
    let s = `${num}`;
    while (s.length < size) s = "0" + s;
    return s;
}

/**
 * Throws a de identified replacement string
 * @param length
 * @param vr - VR of an element
 * @returns {string}
 */
const makeDeIdentifiedValue = function (length) {
        let text = '';

        for(let i = 0; i < length; i++) {
            text += ' ';
        }

        return text;
};

/**
 * Manipulates each byte at the given offset
 * @param datasSet
 * @param {number} offset - position of the byte
 * @param {string} text - text to replace
 */
const manipulateByte = (dataSet, offset, text)=> {
    const byteArr = dataSet.byteArray;

    for (let i = 0; i < text.length; i++) {
        byteArr[offset+ i] = text.charCodeAt(i);
    }
}

/**
 * Modifies each byte with a new value
 * @param dataSet - file buffer
 * @param {Array} chunks - personal info elements
 */
const modifyDataset = (dataSet, chunks, intervaporId) => {
    if (!dataSet) return;

    const byteEl = dataSet.elements;
    let idLength;
    for (let c of chunks) {
        for (let el in byteEl) {
            if (el === c) {
                if ('x00100020' === c) {
                    idLength = dataSet.string(c).length;
                }

                const currentEl = dataSet.elements[c],
                    str = dataSet.string(c),
                    newValue = str && str.length > 0 ? makeDeIdentifiedValue(str.length) : null;

                if (newValue && newValue.length) manipulateByte(dataSet, currentEl.dataOffset, newValue);
            }
        }
    }

    // set intervaporId
    let elementToReplace = (idLength < 9) ? 'x00100020' : 'x00100010';
    for (let el in byteEl) {
        if (el === elementToReplace) {
            const currentEl = dataSet.elements[elementToReplace];
            if (intervaporId && intervaporId.length) manipulateByte(dataSet, currentEl.dataOffset, intervaporId);
        }
    }
}

/**
 * De-Identify a specific tag in a dataset
 *
 * @param ds - Dataset
 * @param {string} tag - specific DICOM tag that needs to be de-identified
 * @param byteArray
 * @param {string} value - string to append at the element
 * @returns {Buffer | TypedArray | ByteStream}
 */
const deidentifyTag = (ds, tag, value) => {
    const el = ds.elements[tag],
        str = ds.string(tag),
        offset = el.dataOffset,
        len = str.length;

    const first = ds.byteArray.slice(0, offset),
        second = ds.byteArray.slice(offset + value.length, ds.byteArray.length);
    //     newVal = Buffer.alloc(10),
    //     middle = newVal.write(value),
    //     result = Buffer.concat([first, new Uint8Array(middle), second], ds.byteArray.length);
    // manipulateByte(ds, offset, value);

    fs.writeSync(path.resolve(storagePath + `/tmp/test_with_pid.dcm`), first);

    const middle = Buffer.from(value, 'utf-8');


    // const byteArr = ds.byteArray;
    //
    // for (let i = 0; i < value.length; i++) {
    //     byteArr[offset+ i] = value.charCodeAt(i);
    // }
    return result;
};

/**
 * Identifies the request's platform and os
 * @param {object} reqHeaders - request headers
 * @returns {object}
 */
const identifyReqPlatform = reqHeaders => {
    const agent = reqHeaders['user-agent'],
        response = {};

    // request received from Mobile
    if (/mobile/i.test(agent)) response.Mobile = true;

    // request received from Mac OS
    if (/like Mac OS X/.test(agent)) {
        response.iOS = /CPU(iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(agent)[2].replace(/_/g, '.');
        response.iPhone = /iPhone/.test(agent);
        response.iPad = /iPad/.test(agent);
    }

    // identifies Android Platform
    if (/Android/.test(agent)) response.Android = /Android ([0-9\.]+)[\);]/.exec(agent)[1];

    // identifies webOS
    if (/webOS\//.test(agent)) response.webOS = /webOS\/([0-9\.]+)[\);]/.exec(agent)[1];

    // identifies intel based Mac
    if (/(Intel|PPC) Mac OS X/.test(agent)) response.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(agent)[2].replace(/_/g, '.') || true;

    // identifies Windows
    if (/Windows NT/.test(agent)) response.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(agent)[1];

    // identifies Postman
    if (agent.includes('PostmanRuntime')) response.postman = true;

    return response;
};

/**
 * Searches for a specific bucket in the S3
 *
 * @param s3
 * @param {string} bucket
 * @returns {Promise<String>}
 */
const getS3Buckets = (s3, bucket) => {
    return new Promise((resolve, reject) => {
        s3.listBuckets((err, data) => {
            if (err || !data) {
                console.error(err);
                return reject(err);
            }

            return resolve(data.Buckets.filter(b => b && Object.keys(b).length > 0 && b.Name === bucket)[0].Name);
        });
    });
}

/**
 * Creates an object in a bucket in S3
 *
 * @param s3
 * @param {string} bucket
 * @param {string} object
 * @returns {Promise<Array>}
 */
const createObjectsToS3 = (s3, bucket, object) => {
    return new Promise((resolve, reject) => {
        s3.putObject({ Key: `${object}/`, Bucket: `${bucket}` }, (err, data) => {
            if (err || !data) {
                console.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

/**
 * Uploads a file to a bucket in S3
 *
 * @param s3
 * @param {string} bucket
 * @param {string} key
 * @param {ByteStream | Buffer | TypedArray} fileBuffer
 * @returns {Promise<Array>}
 */
const uploadToS3 = (s3, bucket, key, fileBuffer) => {
    return new Promise((resolve, reject) => {
        const base64data = new Buffer(fileBuffer, 'binary');

        s3.upload({ Bucket: bucket, Key: key, Body: base64data }, (err, data) => {
            if (err || !data) {
                console.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

/**
 * Fetches the list of objects in a bucket
 *
 * @param s3
 * @param {string} bucket
 * @returns {Promise<Array>}
 */
const getObjects = (s3, bucket) => {
    return new Promise((resolve, reject) => {
        s3.listObjects({ Bucket: bucket }, (err, data) => {
            if (err || !data) {
                console.error(err);
                return reject(err);
            }

            return resolve(data);
        });
    });
}

/**
 * Deletes an object from a bucket
 *
 * @param s3
 * @param {string} bucket
 * @param {string} object
 * @returns {Promise<Array>}
 */
const deleteObjects = (s3, bucket, object) => {
    return new Promise((resolve, reject) => {
        s3.deleteObject({ Bucket: bucket, Key: `${object}` }, (e, data) => {
            if (e || !data) {
                console.error(e);
                return reject(e);
            }

            return resolve(data);
        });
    });
};

/**
 * Searches for a specific object in a bucket
 *
 * @param s3
 * @param {string} bucket
 * @param {Array<string>} objectsList
 * @returns {Promise<Array<Array>>}
 */
const findObject = (s3, bucket, objectsList) => {
    return new Promise((resolve, reject) => {
        getObjects(s3, bucket).then(ob => {
            const { Contents } = ob;

            let promises = [];
            if (Contents && Contents.length) {
                if (objectsList && objectsList.length) {
                    objectsList.forEach(o => {
                        promises.push(
                            new Promise(resolve1 => resolve1(Contents.filter(c => c && Object.keys(c).length && c.Key === `${o}`)))
                        );
                    });

                    return resolve(Promise.all(promises));
                } else return resolve([]);
            } else {
                return resolve([]);
            }
        }).catch(e => reject(e));
    });
}

/**
 * Copies the object from destination to another
 *
 * @param s3
 * @param {string} bucket
 * @param {string} oldObject
 * @param {string} newObject
 * @returns {Promise<array>}
 */
const moveObject = (s3, bucket, oldObject, newObject) => {
    return new Promise((resolve, reject) => {
        findObject(s3, bucket, [oldObject]).then(data => {
            if (data && data.length) {
                const { Key: oldKey } = data[0][0];

                s3.copyObject({ Bucket: bucket, CopySource: `${bucket}/${oldKey}`, Key: `${newObject}` }, (err, d) => {
                    if (err || !d) return reject(err);

                    return resolve(d);
                });
            } else reject(new Error('File could not be uploaded'));
        }).catch(e => reject(e));
    });
}

/**
 * Gets a signed downloadable link for a key
 *
 * @param s3
 * @param {string} bucket
 * @param {string} key
 * @param {number} expiry
 * @returns {Promise<URL>}
 */
const getSignedDownloadableLink = (s3, bucket, key, expiry= 7 * 24 * 60 * 60) => {
    return new Promise((resolve, reject) => {
        findObject(s3, bucket, [key]).then(data => {
            if (data && data.length) {
                s3.getSignedUrl('getObject', { Bucket: bucket, Key: key, Expires: expiry }, (err, url) => {
                    if (err || !url) return reject(err);

                    return resolve(url);
                });
            }
        });
    })
}

/**
 * @description Throws the list of tags that must be de-identified
 * @returns {string[]}
 */
const tagsToBeDeidentified = () => {
    const chunks = [
        '0008, 0090',
        '0008, 1048',
        '0008, 1050',
        '0008, 1060',
        '0032, 1032',
        '0010, 1005',
        '0010, 0010',
        '0010, 0020',
        '0010, 0030',
        '0010, 0032',
        '0010, 0033',
        '0010, 0034',
        '0010, 0035',
        '0010, 0040',
        '0010, 0050',
        '0010, 1000',
        '0010, 1001',
        '0010, 1002',
        '0010, 1005',
        '0010, 1010',
        '0010, 1020',
        '0010, 1021',
        '0010, 1030',
        '0010, 1040',
        '0010, 1060',
        '0010, 1080',
        '0010, 1081',
        '0010, 2154',
        '0010, 2155',
        '0010, 21F0',
        '0010, 2201',
        '0010, 2202',
        '0010, 2203',
    ];
    return chunks.map(c => `x${c.split(', ')[0]}${c.split(', ')[1]}`);
};



const uploadFileToS3 = (
    bucket,
    localFile,
    bucketPath
) => {
    return new Promise(resolve => {
        fs.readFile(path.resolve(STORAGE_ROOT + `/uptake-ctscans/${localFile}`), (err, file) => {
            getS3Buckets(s3, bucket).then(b => {

                const data = new Uint8Array(file);
                uploadToS3(s3, b, bucketPath, data).then(data => {
                    console.info('file uploaded to S3');
                    resolve();
                });
            });
        });
    });
};

module.exports = {
    isSlotInRange1,
    generateOtp,
    randomTxt,
    toTime,
    toSimpleTime,
    minutesFormatter,
    getDay,
    timeInBetween,
    strTimeToMin,
    minToStr,
    parseToDate,
    getTimeInMinutesFromDate,
    dateDiffInDays,
    isblank,
    getDifference,
    isSameTimeTillMinutes,
    getForattedDate,
    differenceInMinutesFromDates,
    capitalizeFirstLetter,
    formatIP,
    notNullString,
    stringCompare,
    dateToString,
    textLimit,
    isSlotInRange,
    encrypt,
    decrypt,
    dateFormat,
    getAge,
    convertDiffInSeconds,
    deleteRecord,
    pad,
    makeDeIdentifiedValue,
    manipulateByte,
    modifyDataset,
    identifyReqPlatform,
    tagsToBeDeidentified,
    getS3Buckets,
    createObjectsToS3,
    uploadToS3,
    getObjects,
    findObject,
    deleteObjects,
    moveObject,
    deidentifyTag,
    getSignedDownloadableLink,
    generatePassword,
    uploadFileToS3
};