var gql = require('graphql-tag');
var LoopBackContext = require('loopback-context');
var app = require('../../../server/server');
var validators = require('./validators');
var utils = require('../../helper/Utils');
const { tablePermissionMap } = require('./PermissionMap');

/**
 * @function this provide the utility function  to ignore case compare
 * @param text
 * @param other
 * @returns {boolean}
 */
function equalsIgnoringCase(text, other) {
    return text.localeCompare(other, undefined, { sensitivity: 'base' }) === 0;
}

/**
 * @function this is used verify if any request should skip to authenticate or need to check login user token
 * @param app
 * @param req
 * @returns {boolean}
 */
function skipAuth(app, req) {
    let origin = req.get('Origin'), referrer = req.get('referrer');

    // Skip the requests from executeQuery route
    let userAgent = req.headers['user-agent'];
    userAgent = (!userAgent) ? '' : userAgent;
    if (req.hostname == 'localhost' && userAgent.indexOf('axios') >= 0)
        return true;

    let obj;
    try {
        obj = gql`${req.body.query}`;
    } catch (e) {
        return false;
    }

    let isAuthenticated = true, shouldSkip = (referrer && origin ? referrer.substring(origin.length) === '/graphiql' : false),
        publicRoutes = tablePermissionMap.publicRoutes,
        operation = obj.definitions[0].operation,
        name = obj.definitions[0].selectionSet.selections[0].name.value;

    publicRoutes.some((route, index) => {
        var matchName = "";
        let item = route;
        if (item.includes('.')) {
            matchName = item.substring(item.indexOf('.') + 1);
        }
        else if (operation === 'mutation') {
            matchName = 'save' + item
        }
        else {
            matchName = 'all' + item
        }
        if (equalsIgnoringCase(matchName, name) || equalsIgnoringCase(item, name)) {
            shouldSkip = true;
            if (eval("typeof " + "validators." + route + " === 'function'")) {
                let obj = gql`${req.body.query}`;
                let args = obj.definitions[0].selectionSet.selections[0].arguments[0].value.fields;
                if (!args)
                    args = obj.definitions[0].selectionSet.selections[0].arguments;
                shouldSkip = eval(route.customValidator)(args);
            }
            return true;
        }
    });
    return shouldSkip
}

function setCustomQueryFilters(req, currentUser) {
    // FIXME: 
    return;
    let obj = gql`${req.body.query}`;
    let name = obj.definitions[0].selectionSet.selections[0].name.value;
    Object.keys(tablePermissionMap).forEach((o) => {
        let item = tablePermissionMap[o];
        if (item.customQueries && item.customQueries[name]) {
            let conditionsObj = item.customQueries[name];
            let args = obj.definitions[0].selectionSet.selections[0].arguments;
            conditionsObj.forEach((condition) => {
                let contextData = currentUser[condition.contextKey];
                let currentData;
                let currentArg;
                args.every(a => {
                    if (a.name.value == condition.key) {
                        currentData = a.value.value;
                        if (a.value.kind == 'IntValue')
                            currentData = parseInt(currentData);
                        currentArg = a;
                        return false;
                    }

                    return true;
                });
                let newValue = getFilterValue(currentData, contextData);
                if (!newValue) {
                    throw new Error(JSON.stringify({ "error": "No permissions for " + currentArg.name.value }));
                }
            });

            return;
        }
    });
}

/**
 * @function this function is used check is request query user is authenticate to allow upsert
 * @param args
 * @param model
 * @returns {boolean}
 */
function isActionAllowed(args, model, isList, related) {
    return new Promise((resolve, reject) => {
        let modelMapObj = tablePermissionMap[model.pluralModelName.toLowerCase()];
        if (!modelMapObj)
            modelMapObj = tablePermissionMap[model.modelName.toLowerCase()];
        let currentUser = getCurrentUser();

        if (!modelMapObj || !currentUser || !currentUser.role) {
            if (isList && modelMapObj.list.public) {
                currentUser = { role: 'public' };
            } else {
                // Permissions not defined
                return resolve(false);
            }
        }

        let role = currentUser.role.toLowerCase && currentUser.role.toLowerCase() || currentUser.role;

        let conditionsObj;
        let action = '';
        let dbObjPromise;

        if (isList == true) {
            if (!modelMapObj.list) {
                // Permissions not defined
                return resolve(false);
            }
            action = 'List';
            conditionsObj = modelMapObj.list[role];
        }
        else if (!args.obj['id'] || args.obj['id'] == '0' || args.obj['id'] == '') {
            if (!modelMapObj.add) {
                // Permissions not defined
                return resolve(false);
            }
            action = 'Add';
            conditionsObj = modelMapObj.add[role];
        }
        else if (args.obj['active'] == 0) {
            if (!modelMapObj.delete) {
                // Permissions not defined
                return resolve(false);
            }
            action = 'Delete';
            conditionsObj = modelMapObj.delete[role];
        }
        else {
            if (!modelMapObj.edit) {
                // Permissions not defined
                return resolve(false);
            }
            action = 'Edit';
            conditionsObj = modelMapObj.edit[role];
        }

        if (!conditionsObj) {
            // Permissions not defined
            return resolve(false);
        }

        if (action == 'Edit' || action == 'Delete') {
            dbObjPromise = getDBObj(model.modelName, args.obj['id']);
        }

        if (action == 'List') {
            setRequestFilters(args, conditionsObj, currentUser, related);

            // Check if function exist - DUP1
            let validator = "validators." + model.pluralModelName + action + role;
            if (eval("typeof " + validator + " === 'function'")) {
                let result = eval(validator)(args, currentUser);
                if (result instanceof Promise) {
                    result.then(r => {
                        return resolve(r);
                    });
                }
                else {
                    return resolve(result);
                }
            }
            else {
                return resolve(true);
            }
        } else {
            if (dbObjPromise) {
                dbObjPromise.then((dbObj) => {
                    conditionsObj.forEach((obj) => {
                        let argsKey;
                        if (action == 'Edit' || action == 'Delete') {
                            argsKey = dbObj[obj.key];
                        } else {
                            argsKey = args.obj[obj.key];
                        }
                        let addkeys = [].concat(currentUser[obj.contextKey]);
                        let isFound = addkeys.findIndex(key => (argsKey + '').toLowerCase() === (key + '').toLowerCase()) != -1;
                        if (!isFound) {
                            return resolve(false);
                        }
                    });
                    // Check if function exist - DUP2
                    let validator = "validators." + model.pluralModelName + action + role;
                    if (eval("typeof " + validator + " === 'function'")) {
                        let result = eval(validator)(args, currentUser, dbObj);
                        if (result instanceof Promise) {
                            result.then(r => {
                                return resolve(r);
                            });
                        }
                        else {
                            return resolve(result);
                        }
                    }
                    else {
                        return resolve(true);
                    }
                });
            } else {
                return resolve(true);
            }
        }
    });
}

function setRequestFilters(args, conditionsObj, currentUser, related) {
    let where = args.where || {};

    for (const i in conditionsObj) {
        let obj = conditionsObj[i];
        if (!related || !conditionsObj.filterRelated) {
            let contextData;
            if (obj.contextKey) {
                contextData = currentUser[obj.contextKey];
                let currentData = where[obj.key];
                let newValue = getFilterValue(currentData, contextData);
                if (newValue != null || newValue != undefined)
                    Object.assign(where, { [obj.key]: newValue });
            }
            else if (obj.value) {
                contextData = obj.value;
                Object.assign(where, { [obj.key]: contextData });
            } else {
                // FIXME: await removed
                //let newValue = eval('validators.' + obj.contextFunc)(args, currentUser);
                //if (newValue instanceof Error) {
                //    throw newValue;
                //}
                //else if (newValue instanceof Array) {
                //    newValue = { inq: newValue };
                //}
                //Object.assign(where, { [obj.key]: newValue });
            }
        }
    }   

    //removed this code to get all list items irrespective of their status
    // if(!where.hasOwnProperty('active')){
    //     Object.assign(where, { active: 1 });
    // }
    args.where = where
}

function getFilterValue(currentData, contextData) {
    if (currentData) {
        if (contextData instanceof Array) {
            if (!contextData.includes(currentData)) {
                // FAIL
                return 0;
            } else {
                // Success
                return currentData;
            }
        } else {
            return (contextData == currentData) ? currentData : 0;
        }
    } else {
        if (contextData instanceof Array) {
            return { inq: contextData };
        } else {
            return contextData;
        }
    }
}

function setFilters(args, model, related) {
    if (!args) {
        args = { where: {} }
    }

    return isActionAllowed(args, model, true, related);
}

function getDBObj(model, id) {
    return new Promise((resolve, reject) => {
        app.models[model].findById(id, (err, res) => {
            if (!res) {
                resolve(false);
                return;
            }
            resolve(res);
        });
    });
}

function customersSave(args, currentUser) {
    if (currentUser.role == 'User') {
        if (args.obj.id != currentUser.id)
            return false;
    }
    return true;
}

function getCurrentUser() {
    let ctx = LoopBackContext.getCurrentContext();
    return ctx && ctx.get('currentUser');
}

module.exports = {
    skipAuth,
    tablePermissionMap,
    isActionAllowed,
    getCurrentUser,
    customersSave,
    setFilters,
    setCustomQueryFilters
}