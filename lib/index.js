(function () {

    'use strict';

    var argv = require('minimist')(process.argv.slice(2)); //Get Args
    var modelData = require('./fileParser')(argv.f);  //Parse Model Data
    var Entity = require('./entity/entity');
    var Schema = require('./schema/schema');
    var Export = require('./export');
    var entities = [];

    /**
     * ARGV
     * -f file to process
     * -s schema name.
     * -d dbms
     * -h help
     */

    var schema = new Schema(argv.s);

    modelData.ownedElements[0].ownedElements.forEach(function(e){
        if (e._type == 'ERDEntity') entities.push(new Entity(e, modelData, schema, argv.d));
    });

    if (argv.d == 'SEQUELIZE')
        Export.squelize(entities);
    else
        Export.dbms(schema, entities);


}).call(this);