// const util = require('../../helper/Utils');
var LoopBackContext = require('loopback-context');
const app = require('../../../server/server');

// function UserdataDeleteSuperadmin(args, currentUser, dbObj) {
//     let argarr = getWhereObject(args);
//     argarr['username'] = dbObj.username + '_' + util.randomTxt(12);
//     return true;
// }

// function UserdataListAdmin(args, currentUser) {
//     let argarr = getWhereObject(args);

//     return new Promise((resolve, reject) => {
//         if (currentUser.role == 'ADMIN') {
//             if (argarr.id) {
//                 app.models.Userdata.find({
//                     where: {
//                         role: 'VENDOR', active: 1
//                     },
//                     fields: { id: true }
//                 }, (err, vendors) => {
//                     let userIds = vendors.map(v => { return v.id; });
//                     userIds.push(argarr.id);
//                     resolve(userIds.includes(argarr.id));
//                 });
//             }
//             else {
//                 argarr.companyid = currentUser.companyId;
//                 resolve(true);
//             }
//         }
//     });
// }

// function CompaniesListAdmin(args, currentUser) {
//     let argarr = getWhereObject(args);
//     return new Promise((resolve, reject) => {
//         if (currentUser.role == 'ADMIN') {
//             if (argarr.id) {
//                 app.models.Company.find({
//                     where: {
//                         type: 'VENDOR', active: 1
//                     },
//                     fields: { id: true }
//                 }, (err, vendors) => {
//                     let companyIds = vendors.map(v => { return v.id; });
//                     companyIds.push(currentUser.companyId);
//                     resolve(companyIds.includes(argarr.id));
//                 });
//             }
//             else {
//                 argarr.id = currentUser.companyId;
//                 resolve(true);
//             }
//         }
//     });
// }

const getWhereObject = (args) => {
    return args.where ? args.where : args.obj;
}

function getCurrentUser() {
    let ctx = LoopBackContext.getCurrentContext();
    return ctx && ctx.get('currentUser');
}

module.exports = {

}