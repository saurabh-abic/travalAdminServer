const _ = require('lodash');

module.exports = function(Permissions) {
    let models = Permissions.registry.modelBuilder.models;

    Permissions.afterRemote('**', function(context, remoteMethodOutput, next) {
        let [name, type] =  context.methodString.split(".");
        console.log("type--->", type);
        if(type === "find"){
            let results = context.result,
                response = [];

            models["Employee"].find({sort: ["id","ASC"]}, (err, res)=>{
                results.forEach(item=>{
                    let val = _.find(res, (user)=> (user.id == item.userid));
                    if(val){
                        response.push({
                            id: item.id,
                            userId: item.userid,
                            name: (val.firstname || "" + val.lastname || "") ,
                            permissions: item.permissions
                        });
                    }
                });
                context.result = response;
                next();
            });
        }
        else if(type === "findById"){
            let results = context.result,
                response = {};

            models["Employee"].findOne({where:{id: results.userid}}, (err, res)=>{
                response = {
                    id: results.id,
                    userId: results.userid,
                    name: (res.firstname || "" + res.lastname || "")
                };

            if(results.permissions){
                let permission =  results.permissions && JSON.parse(results.permissions);
                let keys = Object.keys(permission);
                keys.map(item=>{
                    response[item] = permission[item];
                })
            }
            context.result = response;
            next();
        });

        }
        else{
            next();
        }
    });

    Permissions.observe('before save', function(ctx, next) {
       let keys = Object.keys(ctx.instance),
           permission = {};

       keys.map(item=>{
          if(Array.isArray(ctx.instance[item])){
            permission[item] = ctx.instance[item];
        }
       });

       ctx.instance.permissions = JSON.stringify(permission);
       next();
    });
};