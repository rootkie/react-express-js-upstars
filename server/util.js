'use strict';
const jwt = require('jsonwebtoken')
const config = require('./config/constConfig')

module.exports.makeString = obj => {
    if (obj) {
        return (typeof(obj) == 'string') ? obj: JSON.stringify(obj);
    }
    else {
        return null;
    }
}

module.exports.formatDate = yyyymmdd => {
  let year = yyyymmdd.substring(0, 4)
  let month = yyyymmdd.substring(4, 6)
  let day = yyyymmdd.substring(6, 8)
  let dateString = year + '-' + month + '-' + day
  return new Date(dateString)
}

module.exports.generateToken = user => {
  return jwt.sign(user, config.secret, {
    expiresIn: 3600 // 1 hour
  })
}

module.exports.makeUser = req => {
  const { _id, email, role, profile } = req
  return { _id, profile, role, email }
}