(function(){
    'use strict';

    var fs = require('fs');
    var _ = require('underscore');
    var common = require('./entity/appenders/common');



    module.exports.dbms = function(schema, entities){
        var file = fs.createWriteStream('output.sql');
        file.on('error', function(err) { /* error handling */ });

        schema.createSQL.forEach(function(l){
            file.write(l.toString());
        })

        entities.forEach(function (e) {
            e.createTableSQL.forEach(function(l){
                file.write(l.toString());
            })
        });

        entities.forEach(function (e) {
            if (e.foreignKeyAlterTable.length <= 1) return;

            e.foreignKeyAlterTable.forEach(function(l){
                file.write(l);
            })
        })

        file.end();
    };

    module.exports.squelize = function(entities){

        fs.mkdirSync('models');
        var modelsfile = fs.createWriteStream('models/models.js');
        modelsfile.write("(function(){\n");
        modelsfile.write("\t'use strict;'\n");
        modelsfile.write("\n");
        modelsfile.write("\tvar db = require('./../../config/db');\n");

        entities.forEach(function (e) {
            modelsfile.write ("\tvar " + common.dromedary(e.name,'_').capitalize() + " = require('./"+
                e.raw.tags[0].name.toLowerCase() +"/"+ e.name.dromedary('_') + "Model');\n");
        });

        entities.forEach(function (e) {


            var subFolder = "";
            var baseFolder = "models/";
            var fileName = e.name.dromedary('_');
            var modelName = common.dromedary(e.name,'_').capitalize();


            if (typeof e.raw.tags != 'undefined') {

                subFolder = e.raw.tags[0].name.toLowerCase() + '/';

                if (!fs.existsSync(baseFolder + subFolder)){
                    fs.mkdirSync(baseFolder + subFolder);
                }

                var controllerFile = fs.createWriteStream(baseFolder + subFolder + fileName + 'Controller.js' );
                controllerFile.write("(function(){\n");
                controllerFile.write("\t'use strict;'\n");
                controllerFile.write("\n");
                controllerFile.write("\tvar "+ modelName +" = require('./"+fileName+"Model');\n");
                controllerFile.write("\tvar errorHandler = require('./../../core/errorHandler');\n");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.create = function(req, res){\n");
                controllerFile.write("\t\t"+modelName+".create(req.body)\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.delete = function(req, res){\n");
                controllerFile.write("\t\t"+modelName+".destroy({ where: req.body.where })\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result + ' row(s) affected.'); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.update = function(req, res){\n");
                controllerFile.write("\t\t"+modelName+".update( req.body.update, { where: req.body.where,  fields: req.body.fields })\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result[0] + ' row(s) affected.'); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");


                var routesFile = fs.createWriteStream(baseFolder + subFolder + fileName + 'Routes.js');
                routesFile.write("(function(){\n");
                routesFile.write("\t'use strict;'\n");
                routesFile.write("\n");
                routesFile.write("\tvar "+ fileName +"Controller = require('./"+fileName+"Controller');\n");
                routesFile.write("\n");
                routesFile.write("\n\tmodule.exports.appendProtectedRoutes = function(router){\n");
                routesFile.write("\n\t\trouter.post('/"+fileName+"s', "+fileName+"Controller.create);");
                routesFile.write("\n\t\trouter.put('/"+fileName+"s', "+fileName+"Controller.update);");
                routesFile.write("\n\t\trouter.delete('/"+fileName+"s', "+fileName+"Controller.delete);");
                routesFile.write("\n");
                routesFile.write("\n\t\treturn router;");
                routesFile.write("\n\t};");
                routesFile.write("\n\tmodule.exports.appendPublicRoutes = function(router){");
                routesFile.write("\n");
                routesFile.write("\n\t\treturn router;");
                routesFile.write("\n\t};");


                var modelFile = fs.createWriteStream(baseFolder + subFolder + fileName + 'Model.js');

                //DEFINITION FILE
                e.model.forEach(function(l){
                    modelFile.write(l.toString());
                });

                //RELATIONS FILE
                if (e.relations.length > 0) modelsfile.write ("\n\n\t// "+ e.name +"\n");
                e.relations.forEach(function(l){
                    modelsfile.write("\t" + l.toString());
                });

                modelFile.end();

                routesFile.write("\n}).call(this);");
                routesFile.end();

                controllerFile.write("\n}).call(this);");
                controllerFile.end();
                return;
            };

            var file = fs.createWriteStream(baseFolder + fileName + 'Model.js');

            e.model.forEach(function(l){
                file.write(l.toString());
            })

            file.end();
        });

        modelsfile.write("\n\t//SYNC DB ============= \n");
        modelsfile.write("\tdb.sequelize.sync({force:false}) \n");
        modelsfile.write("\t\t.then(function(){ \n");
        modelsfile.write("\t\t\tconsole.log('DB Synced'); \n");
        modelsfile.write("\t\t}); \n");

        modelsfile.write("\n}).call(this);");
        modelsfile.end();

    }



}).call(this);
