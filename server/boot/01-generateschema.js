const promisify = require('util').promisify,
    fs = require('fs'),
    mkdirp = promisify(require('mkdirp')),
    writeFile = promisify(fs.writeFile),
    readFile = promisify(fs.readFile),
    _ = require("lodash"),
    log = require('simple-node-logger').createSimpleLogger(),
    Constant = require('../../utils/Constant'),
    scriptUtil = require('../../utils/scriptUtil'),
    pluralize = require('pluralize');
const {
    DATASOURCE_NAME,
    COMMON_DIR,
    TABLES_INFO_QUERY,
    IsAtIncrFieldRequired,
    TablePrimaryKey,
    DefaultLoopbackSchemaMap,
    SkipUpdateModelMap,
    schemeOptionMap,
    ENTITY_MAP_TABLE,
    ENTITY_TABLE_MAP_QUERY,
    skipEntityRelation
} = Constant;
const {
    getModelNameBySchema,
    prepareDefaultJs,
    getDSNameForDefaultSchema
} = scriptUtil;

const callback = function (e) { };
/**
 *
 * @param app
 * @param schemaName
 * @param callback
 */
const discoverModels = function (app, schemaName, callback) {
    var dataSource = app.dataSources[DATASOURCE_NAME];
    dataSource.discoverAndBuildModels(
        schemaName, {
        relations: true,
        idInjection: false
    },
        function (err, models) {
            //console.log("----err----", err)

            if (err) return callback(err);
            for (const modelName in models) {
                app.model(models[modelName], {
                    dataSource: dataSource
                });
            }
            //callback();
        });
}

/**
 *
 * @param schemaNames
 */
const prepareModalConfigMap = function (schemaNames) {
    let response = {},
        obj = {
            "dataSource": DATASOURCE_NAME,
            "public": true
        };
    schemaNames.forEach((name) => {
        response[getModelNameBySchema(name, true)] = obj
    });
    return response;
};

// Expose models via REST API
/**
 *
 * @param tableNames
 * @returns {Promise<void>}
 */
async function updateModelConfig(tableNames) {
    const configJson = await readFile('server/model-config.json', 'utf-8');
    const config = JSON.parse(configJson);
    Object.assign(config, prepareModalConfigMap(tableNames));
    await writeFile(
        'server/model-config.json',
        JSON.stringify(config, null, 2)
    );
}

function modifyModelProperty(db, schemaName, content = {}, tableMap = []) {
    if (!IsAtIncrFieldRequired) {
        //await db.discoverPrimaryKeys(schemaName, function (e, data) {
        //let key = JSON.parse(JSON.stringify(data[0] || {})).columnName;
        //console.log("---key---",key,"===schemaName----",schemaName);

        content.properties = scriptUtil.sortByKeys(content.properties)
        if (content.properties && content.properties[TablePrimaryKey]) {
            let primaryKey = { ...content.properties[TablePrimaryKey], ...{ required: false } };
            content.properties[TablePrimaryKey] = primaryKey;
        }
        //});
    }
    if (tableMap.length) {
        let key = pluralize(tableMap[0].ChildEntity)
        content.options.relations[key] = { model: tableMap[0].ChildEntity, type: tableMap[0].Relation, foreignKey: "" }
    }
    return JSON.stringify(content, null, 2)
};
/**
 *
 * @param db
 * @param schemaName
 * @returns {Promise<void>}
 */
async function discover(db, schemaName, entityTableResponse = []) {
    // It's important to pass the same "options" object to all calls
    // of dataSource.discoverSchemas(), it allows the method to cache
    // discovered related models
        let tableMap = _.filter(entityTableResponse, { ParentEntity: schemaName });


    db.discoverSchemas(schemaName, schemeOptionMap).then((schema)=>{
        db.discoverExportedForeignKeys(schemaName).then((pkSchemas)=>{
            let str = DATASOURCE_NAME + '.' + schemaName,
            sn = getModelNameBySchema(schemaName, true);

            if (DefaultLoopbackSchemaMap[schemaName]) {
                str = getDSNameForDefaultSchema(Object.keys(schema)[0], schemaName);
            }
            let modelJs = COMMON_DIR + '/' + sn + '.js',
                modelJson = COMMON_DIR + '/' + sn + '.json',
                content = schema[str];
            pkSchemas.forEach((item, index) => {
                let key = item.fkName;
                if (content.options.relations[key])
                    key = pluralize(item.fkTableName + item.fkName);
                let tName = item.fkTableName[0].toUpperCase() + item.fkTableName.substr(1);
                content.options.relations[key] = { type: 'hasMany', model: tName, foreignKey: item.fkColumnName };
            });

            if (!fs.existsSync(modelJs)) {
                fs.writeFileSync(
                    modelJs,
                    prepareDefaultJs(sn)
                );
            }
            // check if any model confog exist
            if (fs.existsSync(modelJson)) {
                let configJson = fs.readFileSync(modelJson, 'utf-8'),
                    schemaProps = SkipUpdateModelMap[schemaName] ? {} : schema[str];
                content = {
                    ...JSON.parse(configJson),
                    ...schemaProps
                };
            }

            // write model json with updated props from db table
            fs.writeFileSync(
                modelJson,
                modifyModelProperty(db, schemaName, content, tableMap)
            );
        });
    });
}

module.exports = function (app) {
    if (process.argv.length > 2 && (process.argv[2].toLowerCase() == 'generate')) {
         console.log("###Generating models");
         let dataSource = app.dataSources[DATASOURCE_NAME],
             params = [DATASOURCE_NAME],
             entityMapParam = [],
             sql = TABLES_INFO_QUERY,
             tableNames = [];
         dataSource.connector.execute(sql, params, function (err, data) {
             if (err) {
                 console.log(err);
             } else {
                 if (!skipEntityRelation) {
                     dataSource.connector.execute(ENTITY_TABLE_MAP_QUERY, entityMapParam, function (entityErr, entityData) {
                         let entityTableResponse = entityData && JSON.parse(JSON.stringify(entityData))
 
                         console.log("--entityTableResponse---", entityTableResponse);
                         data.forEach(table => {
                             let schemaName = getModelNameBySchema(table.TABLE_NAME);
                             if (!schemaName.includes(ENTITY_MAP_TABLE)) {
                                 tableNames.push(schemaName);
                                 discoverModels(app, schemaName, callback);
                                 discover(dataSource, schemaName, entityTableResponse);
                             }
                         });
                         // called to update the model config to add custum models
                         updateModelConfig(tableNames);
                     });
                 }
 
             }
         });
         // print all models name from DB
         let modelNames = Object.keys(app.models);
         let models = [];
         modelNames.forEach(function (m) {
             let modelName = app.models[m].modelName;
             if (models.indexOf(modelName) === -1) {
                 models.push(modelName);
             }
         });
     }
 };