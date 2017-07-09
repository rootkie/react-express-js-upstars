'use strict';
const jwt = require('jsonwebtoken')
const config = require('./config/constConfig')

module.exports.makeString = obj => {
  if (obj) {
    return (typeof(obj) == 'string') ? obj : JSON.stringify(obj);
  }
  else {
    return null;
  }
}

module.exports.formatDate = yymmdd => {
  let year = yymmdd.substring(0, 4)
  let month = yymmdd.substring(4, 6)
  let day = yymmdd.substring(6, 8)
  let dateString = year + '-' + month + '-' + day
  return new Date(dateString)
}

module.exports.generateToken = req => {
  const {
    _id,
    role,
    status
  } = req
  const user = {
    _id,
    role,
    status
  }
  return jwt.sign(user, config.secret, {
    expiresIn: 10800 // 3 hour
  })
}