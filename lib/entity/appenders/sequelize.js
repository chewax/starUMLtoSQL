(function(){
    'use strict';


    (function(){
        'use strict';

        var dbschema = "";
        var common = require('./common');

        module.exports = function(_e, _model, schema) {
            dbschema = schema;

            return {
                name: _e.name,
                raw: _e,
                model: defineModel(_e, _model)
            }
        };


        function defineModel(_e, _model) {
            var sentence = [];
            sentence.push("(function(){\n");
            sentence.push("\t'use strict'\n");
            sentence.push("\n");
            sentence.push("\tvar db = require('../../config/db');\n");
            sentence.push("\n");
            sentence.push("\tvar " +  common.dromedary(_e.name,'_').capitalize() +" = db.sequelize.define ('"+ _e.name +"', {");
            sentence.push("\n\n");

            if (typeof _e.columns != 'undefined')
                var cols = defineColumns(_e, _model);

            sentence = sentence.concat(cols);

            sentence.push('\t},\n');
            sentence.push('\t{\n');

            if (typeof _e.documentation != 'undefined') {
                sentence.push("\t\tcomment: '"+_e.documentation.commentize()+"',\n");
            }
            sentence.push("\t\tfreezeTableName: true\n");
            sentence.push('\t});\n\n');

            sentence.push('\t' + _e.name.capitalize()+".sync({force:true}).then(function(){\n");
            sentence.push('\t\tconsole.log("Table '+ common.dromedary(_e.name,'_').capitalize() +' Created");\n');
            sentence.push('\t});\n\n');
            sentence.push('\tmodule.exports = '+common.dromedary(_e.name,'_').capitalize()+';\n\n');
            sentence.push("}).call(this);");
            return sentence;
        }

        function defineColumns(_e, _model){

            var sentence = [];
            _e.columns.forEach(function(c, idx, array){

                sentence.push("\t\t"+common.dromedary(c.name,"_") +": {\n");

                switch (c.type) {

                    case 'VARCHAR':
                        sentence.push("\t\t\ttype: db.Sequelize.STRING,\n");
                        break;

                    default:
                        sentence.push("\t\t\ttype: db.Sequelize."+c.type+",\n");
                }

                if (c.primaryKey) sentence.push("\t\t\tprimaryKey: true,\n");
                if (c.primaryKey && !c.foreignKey) sentence.push("\t\t\tautoIncrement: true,\n");
                sentence.push("\t\t\tfield: '"+c.name+"'");
                if (c.unique) sentence.push(",\n\t\t\tunique: true");
                if (c.nullable) sentence.push(",\n\t\t\tallowNull: true");

                if (typeof c.documentation != 'undefined') {
                    sentence.push(",\n\t\t\tcomment: '"+c.documentation+"'");
                }

                if (c.foreignKey) {

                    var referencedEntity = null;
                    var referencedColumn = null;

                    if (typeof c.referenceTo != 'undefined') {
                        var references = common.getReferences(c.referenceTo.$ref, _model);
                        referencedEntity = references.entity;
                        referencedColumn = references.column;
                    }

                    sentence.push(",\n\t\t\treferences: {\n");
                    sentence.push("\t\t\t\tmodel: '"+ referencedEntity +"',\n");
                    sentence.push("\t\t\t\tkey: '"+ referencedColumn+ "'\n");
                    sentence.push("\t\t\t}");
                }
                sentence.push("\n\t\t},\n\n");

            });

            return sentence;
        }

    }).call(this);


}).call(this);
