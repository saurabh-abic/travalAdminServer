const startGraphql = require('../../common/modules/loopback-graphql/dist');

module.exports = function(server) {
    startGraphql(server, {});
    var remotes = server.remotes();


    remotes.before('**', function(ctx, next){
        let accesstoken = ctx.req.headers.accesstoken;

        let [name, type] =  ctx.methodString.split(".");
        if(type === "login"){
            next();
        }else{
            server.models.AccessToken.findById(accesstoken, function (err, token) {
                if(!token) {
                    ctx.res.status(401);
                    ctx.res.send({
                        'Error': 'Unauthorized',
                        'Message': 'You need to be authenticated to access this endpoint'
                    });
                }
                token.validate(function (err, isValid) {
                    if (err) {
                        ctx.res.status(401);
                        ctx.res.send({
                            'Error': 'Unauthorized',
                            'Message': 'You need to be authenticated to access this endpoint'
                        });
                    } else if (isValid) {
                        next();
                    } else {
                        ctx.res.status(401);
                        ctx.res.send({
                            'Error': 'Unauthorized',
                            'Message': 'You need to be authenticated to access this endpoint'
                        });
                    }
                });
            });
        }
    });
    

    // modify all returned values
    remotes.after('**', function (ctx, next) {
        let filter;
        if (ctx.args && ctx.args.filter) {
            if (typeof ctx.args.filter === 'string' || ctx.args.filter  instanceof String)
                filter = JSON.parse(ctx.args.filter).where;
            else
                filter = ctx.args.filter.where;
        }

        let [name, type] =  ctx.methodString.split(".");
        let totalCount = 0;
        if(type === "find"){
            if (!ctx.res._headerSent) {
                this.count(filter, function (err, count) {
                    totalCount = count;
                    ctx.res.set('Access-Control-Expose-Headers', 'Content-Range');
                    ctx.res.set('Content-Range' , count);
                    next();
                 });
            }
        }
        else if(type === "login"){
            let val = {...ctx.result.__data};
            server.models.Employee.findById(val.userId, (err, res)=>{
               let newRes = {...ctx.result.__data, name: res.firstname + " " + res.lastname};
               ctx.res.send(newRes);
            });
        }
        else {
            next();
        }

    });
};




