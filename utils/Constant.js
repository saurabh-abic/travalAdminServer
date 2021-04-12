const DATASOURCE_NAME = 'travel',
    ENTITY_MAP_TABLE = 'entityrelationmap',
    AWS_REGION = "us-west-2",
    ORIGINAL_NUMBER = "",
    COMMON_DIR = 'common/models/',
    APPLICATION_ID = "",
    REGISTERED_KEYWORD = "",
    SENDER_ID = "",
    TABLES_INFO_QUERY = 'SELECT TABLE_NAME FROM information_schema.tables where table_schema = ?',
    ENTITY_TABLE_MAP_QUERY = 'SELECT * FROM entityrelationmap',
    TableSpecialCharMap = { underscore: '_', hyphen: '-' },
    IsAtIncrFieldRequired = false,
    OverrideTableMap = { Users: 'users' },
    TablePrimaryKey = 'id',
    DefaultLoopbackSchemaMap = {
        Users: 'Users'
    }, SkipUpdateModelMap = { Users: 'Users' }, schemeOptionMap = {
        relations: true
    },
    skipEntityRelation = false;
    IMAGE_PATH = 'https://lroiphotos.s3.ap-south-1.amazonaws.com/files/';
    LOGIN_PATH = 'http://15.206.222.46:9443/login?';

module.exports = {
    DATASOURCE_NAME,
    COMMON_DIR,
    TABLES_INFO_QUERY,
    TableSpecialCharMap,
    IsAtIncrFieldRequired,
    OverrideTableMap,
    TablePrimaryKey,
    DefaultLoopbackSchemaMap,
    SkipUpdateModelMap,
    schemeOptionMap,
    ENTITY_MAP_TABLE,
    ENTITY_TABLE_MAP_QUERY,
    skipEntityRelation,
    AWS_REGION,
    ORIGINAL_NUMBER,
    APPLICATION_ID,
    REGISTERED_KEYWORD,
    SENDER_ID,
    IMAGE_PATH,
    LOGIN_PATH
};