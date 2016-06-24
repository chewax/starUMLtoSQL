(function(){
    'use strict';

    var mySQLAppender = require('./appenders/mysql');
    var postgreAppender = require('./appenders/postgre');
    var sequelizeAppender = require('./appenders/sequelize');

    var dbschema = "";

    module.exports = function(_e, _model, schema, dbms) {
        dbschema = schema;

        switch (dbms) {
            case 'POSTGRE':
                return new postgreAppender(_e, _model, schema);
                break;

            case 'MYSQL':
                return new mySQLAppender(_e, _model, schema);
                break;

            default :
                return new sequelizeAppender(_e, _model, schema);
        }

    };


}).call(this);