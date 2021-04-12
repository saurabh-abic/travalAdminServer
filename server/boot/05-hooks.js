const startGraphql = require('../../common/modules/loopback-graphql/dist');

module.exports = function(server) {
    startGraphql(server, {});
    var remotes = server.remotes();
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
        }else {
            next();
        }

    });
};




