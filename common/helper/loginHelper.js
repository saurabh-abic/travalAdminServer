
const request = require('request');
const constant = require('../../utils/Constant')

const login = (email, password) => {
       let url = constant.LOGIN_PATH+"email="+email+"&password="+password+""
     return new Promise((resolve, reject) => {
         request.post(
             url,
             (err, data) => {
                 if (err) {
                  
                    reject(new Error(JSON.stringify({ "error":"Invalid email or password." })))
                    return;
                 }
                 else {
                     resolve(data);
                     return;
                 }
             });
     });
 }
 module.exports = {
    login
};