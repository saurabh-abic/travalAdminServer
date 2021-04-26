var graphiqlExpress = require('graphql-server-express').graphiqlExpress;
var graphqlExpress = require('graphql-server-express').graphqlExpress;
var makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
var bodyParser = require('body-parser');

var abstractTypes  = require('./ast').abstractTypes;
var resolvers  = require('./resolvers').resolvers;
var generateTypeDefs  = require('./ast').typedefs;

module.exports =  function boot(app, options) {

  const models = app.models();
  let types = abstractTypes(models);
  let schema = makeExecutableSchema({
    typeDefs: generateTypeDefs(types),
    resolvers: resolvers(models),
    resolverValidationOptions: {
      requireResolversForAllFields: false,
    },
  });

  let graphiqlPath = options.graphiqlPath || '/graphiql';
  let path = options.path || '/graphql';

  app.use(path, bodyParser.json(), graphqlExpress(req => {
    return {
      schema,
      context: req,
    };
  }));
  app.use(graphiqlPath, graphiqlExpress({
    endpointURL: path,
  }));
};
