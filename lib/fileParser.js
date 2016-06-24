(function(){
    'use strict';

    var jsonfile = require('jsonfile');

    module.exports = function(file){
        var json = jsonfile.readFileSync(file);
        return json;
    }

}).call(this);
