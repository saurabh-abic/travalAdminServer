var Constant = require('./Constant'),
    _ = require("lodash");


const getDSNameForDefaultSchema = (schemaProp = "", schemaName) => {
    return schemaProp.split('.')[0] + "."+schemaName
};

const getModelNameBySchema = (schema, removeSpelChar) => {
  let string = schema.charAt(0).toUpperCase() + schema.slice(1),
    {
      underscore,
      hyphen
    } = Constant.TableSpecialCharMap;
  if (removeSpelChar && string.includes(underscore)) {
    let arr = string.split(underscore);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    string = arr.join('');
  }
  return string;
};

const prepareDefaultJs = (schemaName) => {
  return `module.exports = function(${schemaName}) {};`
};


const sortByKeys = object => {
    const keys = Object.keys(object);
    const sortedKeys = _.sortBy(keys);
    return _.fromPairs(
        _.map(sortedKeys, key => [key, object[key]])
    )
};

module.exports = {
  getModelNameBySchema,
  prepareDefaultJs,
  getDSNameForDefaultSchema,
  sortByKeys
};
