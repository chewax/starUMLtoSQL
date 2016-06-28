(function(){
    'use strict';

    var dbschema = "";
    var common = require('./common');

    module.exports = function(_e, _model, schema) {
        dbschema = schema;

        return {
            name: _e.name,
            raw: _e,
            createTableSQL: createTableMySQL(_e),
            foreignKeyAlterTable: foreignKeyMySQL(_e, _model)
        }

    };


    function createTableMySQL(_e) {
        var sentence = [];
        sentence.push("CREATE TABLE " + common.schemaPrefix(dbschema) + _e.name + " (");
        sentence.push("\n");

        if (typeof _e.columns != 'undefined')
            var cols = createColumnsMySQL(_e);

        sentence = sentence.concat(cols);

        sentence.push(');');
        sentence.push('\n');
        sentence.push('\n');

        return sentence;
    }

    function createColumnsMySQL(_e){

        var sentence = [];
        _e.columns.forEach(function(c, idx, array){

            sentence.push(c.name +' ');

            switch (c.type) {
                case 'INTEGER':
                    if (c.length == 0 ) c.length = 11;
                    sentence.push("INT("+ c.length +")");
                    break;

                case 'VARCHAR':
                    if (c.length == 0 ) c.length = 50;
                    sentence.push("VARCHAR("+ c.length +")");
                    break;

                default:
                    sentence.push(c.type);
            }

            if (c.primaryKey || c.foreignKey) sentence.push(" UNSIGNED");
            if (c.primaryKey && !c.foreignKey) sentence.push(" AUTO_INCREMENT");

            if (c.unique) sentence.push(" UNIQUE");
            if (!c.nullable) sentence.push(" NOT NULL");

            sentence.push(",");
            sentence.push("\n");
        });

        sentence.push("PRIMARY KEY( ");
        _e.columns.forEach(function(c, idx, array){
            if (c.primaryKey) {

                //If not first push comma
                if (idx != 0){
                    sentence.push(",");
                }
                sentence.push(c.name);

            }
        });
        sentence.push(' )\n');

        return sentence;
    }


    function foreignKeyMySQL(_e, _model){
        var sentence = [];



        if (typeof _e.columns != 'undefined') {

            var fkindex = 0;

            _e.columns.forEach(function(c, idx, array){

                if (!c.foreignKey) return;

                fkindex += 1;

                var referencedEntity = null;
                var referencedColumn = null;


                if (typeof c.referenceTo != 'undefined') {
                    var references = common.getReferences(c.referenceTo.$ref, _model);
                    referencedEntity = references.entity;
                    referencedColumn = references.column;
                }

                sentence.push('ALTER TABLE ' + common.schemaPrefix(dbschema) + _e.name + ' ADD CONSTRAINT fk_' +
                    _e.name + fkindex + ' FOREIGN KEY (' + c.name + ')');

                if (referencedColumn != null)
                    sentence.push(' REFERENCES ' + common.schemaPrefix(dbschema) + referencedEntity + ' (' + referencedColumn + ') ON DELETE CASCADE ON UPDATE CASCADE;');

                else
                    sentence.push(';');

                sentence.push("\n");

            });
        }

        sentence.push('\n');

        return sentence;

    }


}).call(this);
