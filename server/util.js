const jwt = require('jsonwebtoken')

module.exports.generateToken = req => {
  const {
    _id,
    roles,
    status,
    classes,
    name
  } = req
  const user = {
    _id,
    roles,
    status,
    classes,
    name
  }
  return jwt.sign(user, process.env.SECRET, {
    expiresIn: '30m'
  })
}

module.exports.generateRefresh = _id => {
  const user = {
    _id
  }
  return jwt.sign(user, process.env.SECRET_REFRESH, {
    expiresIn: '90d'
  })
}

module.exports.checkRole = req => {
  const {
    roles,
    params,
    decoded
  } = req
  // Check if he has a role associated to perform administrative functions
  // If not, then check if he is checking one's own stuff
  for (const list in roles) {
    if (decoded.roles.indexOf(roles[list]) !== -1) {
      return {
        privilege: true,
        auth: true
      }
    }
  }
  if (params === decoded._id) {
    return {
      privilege: false,
      auth: true
    }
  } else {
    return {
      privilege: false,
      auth: false
    }
  }
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
