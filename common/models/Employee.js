module.exports = function(Employee) {

    Employee.observe('after save', function(ctx, next) {
        const models = ctx.Model.app.models["Permissions"];
        let id = ctx.instance.id;
        models.findOne({where: {userId: id}}, (err, res)=>{
                if(!err && !res){
                    models.create({
                        userid: id
                    });
                }
            next();
         });
    });
};