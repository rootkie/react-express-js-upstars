'use strict';

module.exports.makeString = function(obj) {
    if (obj) {
        return (typeof(obj) == 'string') ? obj: JSON.stringify(obj);
    }
    else {
        return null;
    }
}
