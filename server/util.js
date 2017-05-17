'use strict';

module.exports.makeString = function(obj) {
    if (obj) {
        return (typeof(obj) == 'string') ? obj: JSON.stringify(obj);
    }
    else {
        return null;
    }
}

module.exports.formatDate = function (yymmdd) {
  let year = yymmdd.substring(0, 4)
  let month = yymmdd.substring(4, 6)
  let day = yymmdd.substring(6, 8)
  let dateString = year + '-' + month + '-' + day
  return new Date(dateString)
}