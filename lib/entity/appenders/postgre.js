(function(){
    'use strict';


    var dbschema = "";
    var common = require('./common');

    module.exports = function(_e, _model, schema) {
        dbschema = schema;

        return {
            name: _e.name,
            raw: _e,
            createTableSQL: createTablePOSTGRE(_e),
            foreignKeyAlterTable: foreignKeyPOSTGRE(_e, _model)
        };

    };

    function createTablePOSTGRE(_e) {
        var sentence = [];
        sentence.push("CREATE TABLE " + common.schemaPrefix(dbschema) + _e.name + " (");
        sentence.push("\n");

        if (typeof _e.columns != 'undefined')
            var cols = createColumnsPOSTGRE(_e);

        sentence = sentence.concat(cols);

        sentence.push(');');
        sentence.push('\n');
        sentence.push('\n');

        return sentence;
    }

    function createColumnsPOSTGRE(_e) {

        var sentence = [];
        _e.columns.forEach(function(c, idx, array){

            sentence.push(c.name +' ');

            if (c.primaryKey) sentence.push('SERIAL')
            else {
                switch (c.type) {
                    case 'DATETIME':
                        sentence.push('TIMESTAMP');
                        break;
                    default:
                        sentence.push(c.type);
                }

            }

            if (c.length != 0 ) sentence.push("("+ c.length +")");
            if (c.unique) sentence.push(" UNIQUE");
            if (!c.nullable) sentence.push(" NOT NULL");
            if (c.primaryKey) sentence.push(" PRIMARY KEY");

            //If not last push comma
            if (idx != array.length - 1){
                sentence.push(",");
            }

            sentence.push("\n");
        });

        return sentence;
    }


    function foreignKeyPOSTGRE(_e, _model){
        var sentence = [];

        if (typeof _e.columns != 'undefined') {

            _e.columns.forEach(function(c, idx, array){

                if (!c.foreignKey) return;

                var referencedEntity = null;
                var referencedColumn = null;


                if (typeof c.referenceTo != 'undefined') {
                    var references = common.getReferences(c.referenceTo.$ref, _model);
                    referencedEntity = references.entity;
                    referencedColumn = references.column;
                }

                //ALTER TABLE distributors ADD CONSTRAINT distfk FOREIGN KEY (address) REFERENCES addresses (address) MATCH FULL;
                sentence.push('ALTER TABLE ' + common.schemaPrefix(dbschema) + _e.name + ' ADD CONSTRAINT ' +
                    _e.name.substr(0,4) + 'fk FOREIGN KEY (' + c.name + ')');

                if (referencedColumn != null)
                    sentence.push(' REFERENCES ' + common.schemaPrefix(dbschema) + referencedEntity + ' (' + referencedColumn + ') MATCH FULL;');
                else
                    sentence.push(';');

                sentence.push("\n");

            });
        }

        sentence.push('\n');

        return sentence;

    }

}).call(this);
