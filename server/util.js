'use strict';
const jwt = require('jsonwebtoken')
const config = require('./config/constConfig')

module.exports.formatDate = yyyymmdd => {
  let year = yyyymmdd.substring(0, 4)
  let month = yyyymmdd.substring(4, 6)
  let day = yyyymmdd.substring(6, 8)
  let dateString = year + '-' + month + '-' + day
  return new Date(dateString)
}

module.exports.generateToken = req => {
  const {
    _id,
    roles,
    status,
    classes
  } = req
  const user = {
    _id,
    roles,
    status,
    classes
  }
  return jwt.sign(user, config.secret, {
    expiresIn: '100h'
  })
}