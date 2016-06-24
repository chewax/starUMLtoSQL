(function(){
    'use strict';


    module.exports = schemaSQL;

    function schemaSQL(sch) {

        var sentence = [];

        if (typeof sch != 'undefined' || sch != null) {
            sentence.push("CREATE SCHEMA " + sch + ";");
            sentence.push("\n");
            sentence.push("\n");
        }

        return {
            name: sch,
            createSQL: sentence
        }
    }

}).call(this);
