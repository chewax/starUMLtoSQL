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
                e.raw.tags[0].name.toLowerCase() +"/models/"+ e.name.dromedary('_') + "Model');\n");
        });

        entities.forEach(function (e) {


            var subFolder = "";
            var baseFolder = "models/";
            var fileName = e.name.dromedary('_');
            var modelName = common.dromedary(e.name,'_').capitalize() + 'Model';
            var className = common.dromedary(e.name,'_').capitalize();


            if (typeof e.raw.tags != 'undefined') {

                subFolder = e.raw.tags[0].name.toLowerCase() + '/';

                if (!fs.existsSync(baseFolder + subFolder)){
                    fs.mkdirSync(baseFolder + subFolder);
                }

                if (!fs.existsSync(baseFolder + subFolder + 'models/')){
                    fs.mkdirSync(baseFolder + subFolder + 'models/');
                }

                if (!fs.existsSync(baseFolder + subFolder + 'controllers/')){
                    fs.mkdirSync(baseFolder + subFolder + 'controllers/');
                }

                if (!fs.existsSync(baseFolder + subFolder + 'routes/')){
                    fs.mkdirSync(baseFolder + subFolder + 'routes/');
                }


                var classFile = fs.createWriteStream(baseFolder + subFolder + fileName +".js");
                classFile.write("(function(){\n");
                classFile.write("\t'use strict;'\n");
                classFile.write("\n");
                classFile.write("\tvar "+ modelName +" = require('./models/"+fileName+"Model');\n");
                classFile.write("\tvar errorHandler = require('./../../utils/errors/errorHandler');\n");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\tvar "+className+" = function() {\n\n");
                classFile.write("\t};");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\t"+className+".findOne = function(_where) {\n");
                classFile.write("\t\treturn "+ modelName+".findOne({where: _where});\n");
                classFile.write("\t};");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\t"+className+".create = function(data){\n");
                classFile.write("\t\treturn "+ modelName+".create(data);\n");
                classFile.write("\t};");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\t"+className+".delete = function(_where){\n");
                classFile.write("\t\treturn "+ modelName+".destroy({ where: _where });\n");
                classFile.write("\t};");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\t"+className+".update = function(data, _where, _fields){\n");
                classFile.write("\t\tvar options = { where: _where };\n");
                classFile.write("\t\tif (typeof _fields != 'undefined' && _fields != null) options.fields = _fields;\n");
                classFile.write("\t\treturn "+ modelName+".update( data, options);\n");
                classFile.write("\t};");
                classFile.write("\n");
                classFile.write("\n");
                classFile.write("\tmodule.exports = "+className+";\n\n");

                var controllerFile = fs.createWriteStream(baseFolder + subFolder + "controllers/" + fileName + 'Controller.js' );
                controllerFile.write("(function(){\n");
                controllerFile.write("\t'use strict;'\n");
                controllerFile.write("\n");
                controllerFile.write("\tvar "+ className +" = require('../"+fileName+"');\n");
                controllerFile.write("\tvar errorHandler = require('./../../../utils/errors/errorHandler');\n");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.create = function(req, res){\n");
                controllerFile.write("\t\t"+ className +".create(req.body)\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.delete = function(req, res){\n");
                controllerFile.write("\t\t"+ className +".destroy(req.body.where)\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result + ' row(s) affected.'); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");
                controllerFile.write("\n");
                controllerFile.write("\tmodule.exports.update = function(req, res){\n");
                controllerFile.write("\t\t"+ className +".update( req.body.update, req.body.where, req.body.fields)\n");
                controllerFile.write("\t\t\t.then(function(result){ res.status(200).json(result[0] + ' row(s) affected.'); })\n");
                controllerFile.write("\t\t\t.catch(function(err){ erroHandler.handleError(err, req, res); })\n");
                controllerFile.write("\t};");
                controllerFile.write("\n");


                var routesFile = fs.createWriteStream(baseFolder + subFolder + "routes/" + fileName + 'Routes.js');
                routesFile.write("(function(){\n");
                routesFile.write("\t'use strict;'\n");
                routesFile.write("\n");
                routesFile.write("\tvar "+ fileName +"Controller = require('../controllers/"+fileName+"Controller');\n");
                routesFile.write("\n");
                routesFile.write("\n\tmodule.exports.appendProtectedRoutes = function(router){\n");
                routesFile.write("\n\t\trouter.post('/"+e.name.replace("_", "-")+"s', "+fileName+"Controller.create);");
                routesFile.write("\n\t\trouter.put('/"+e.name.replace("_", "-")+"s', "+fileName+"Controller.update);");
                routesFile.write("\n\t\trouter.delete('/"+e.name.replace("_", "-")+"s', "+fileName+"Controller.delete);");
                routesFile.write("\n");
                routesFile.write("\n\t\treturn router;");
                routesFile.write("\n\t};");
                routesFile.write("\n\tmodule.exports.appendPublicRoutes = function(router){");
                routesFile.write("\n");
                routesFile.write("\n\t\treturn router;");
                routesFile.write("\n\t};");


                var modelFile = fs.createWriteStream(baseFolder + subFolder + "models/"+ fileName + 'Model.js');

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

                classFile.write("\n}).call(this);");
                classFile.end();

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
