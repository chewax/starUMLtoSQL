(function(){
    'use strict';

    var _ = require('underscore');

    module.exports.schemaPrefix = function(dbschema) {
        if (typeof dbschema.name == 'undefined' ||  dbschema.name == null) {
            return ""
        }
        else {
            return dbschema.name + "."
        }
    };

    module.exports.getReferences = function (columnReference, _model){

        var targetCol = {};
        var targetentity = {};

        _model.ownedElements[0].ownedElements.forEach(function(e){
            var col = _.findWhere(e.columns, {_id: columnReference});
            if (typeof col != 'undefined') {
                targetCol = col;
                targetentity = e;
            }
        });

        return {
            column: targetCol.name,
            entity: targetentity.name
        }
    };

    module.exports.dromedary = function(text, separator) {
        var parts = text.split(separator);
        var result = parts[0];
        for (var i = 1; i < parts.length; i++) {
            result += parts[i].capitalize();
        }

        return result;
    };

    String.prototype.commentize = function() {
        var temp = this.replace(/\n/g, "; ");
        temp = temp.replace(/'/g, "");
        temp = temp.replace(/"/g, "");
        return temp;
    };

    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    String.prototype.dromedary = function(separator) {
        var parts = this.split(separator);
        var result = parts[0];
        for (var i = 1; i < parts.length; i++) {
            result += parts[i].capitalize();
        }

        return result;
    };

}).call(this);
