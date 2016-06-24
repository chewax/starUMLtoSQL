(function(){
    'use strict';

    var fs = require('fs');
    var _ = require('underscore');



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

        entities.forEach(function (e) {

            if (typeof e.raw.tags != 'undefined') {

                if (!fs.existsSync('models/'+ e.raw.tags[0].name)){
                    fs.mkdirSync('models/'+ e.raw.tags[0].name);
                }

                var file = fs.createWriteStream('models/' + e.raw.tags[0].name +'/'+ e.name.dromedary('_').capitalize() + 'Model.js');
                file.on('error', function(err) { /* error handling */ });

                e.model.forEach(function(l){
                    file.write(l.toString());
                })

                file.end();
                return;
            };

            var file = fs.createWriteStream('models/' + e.name.dromedary('_').capitalize() + 'Model.js');
            file.on('error', function(err) { /* error handling */ });

            e.model.forEach(function(l){
                file.write(l.toString());
            })

            file.end();
        });

    }



}).call(this);
