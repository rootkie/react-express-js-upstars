'use strict'
const jwt = require('jsonwebtoken')
const config = require('./config/constConfig')

module.exports.formatDate = yyyymmdd => {
  yyyymmdd = yyyymmdd.constructor === String ? yyyymmdd : JSON.stringify(yyyymmdd)
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

module.exports.checkRole = req => {
  const {
    roles,
    params,
    decoded
  } = req
  if (params !== decoded._id) {
    for (const list in roles) {
      if (decoded.roles.indexOf(roles[list]) !== -1) return true
    }
    return false
  } else return true

  // Or simply return true and comment the entire code for testing so it will always work.
}

module.exports.checkClass = req => {
  const {
    roles,
    params,
    decoded
  } = req
  if (decoded.classes.indexOf(params) === -1) {
    for (const list in roles) {
      if (decoded.roles.indexOf(roles[list]) !== -1) return true
    }
    return false
  } else return true
  // Or simply return true and comment the entire code for testing so it will always work.
}
