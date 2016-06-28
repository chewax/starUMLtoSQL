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

            if (typeof e.raw.tags != 'undefined') {

                if (!fs.existsSync('models/'+ e.raw.tags[0].name.toLowerCase())){
                    fs.mkdirSync('models/'+ e.raw.tags[0].name.toLowerCase());
                }

                var file = fs.createWriteStream('models/' + e.raw.tags[0].name +'/'+ e.name.dromedary('_') + 'Model.js');
                file.on('error', function(err) { /* error handling */ });

                e.model.forEach(function(l){
                    file.write(l.toString());
                });

                if (e.relations.length > 0) modelsfile.write ("\n\n\t// "+ e.name +"\n");
                e.relations.forEach(function(l){
                    modelsfile.write("\t" + l.toString());
                });

                file.end();
                return;
            };

            var file = fs.createWriteStream('models/' + e.name.dromedary('_') + 'Model.js');
            file.on('error', function(err) { /* error handling */ });

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
