const config = require('./config/constConfig')
const jwt = require('jsonwebtoken')

module.exports.hasRole = function(role) {
  return (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token']
      // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token.'
          })
        }
        else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded
          let len = role.length
          for (let i = 0; i < len; i++) {
            if (req.decoded.role.indexOf(role[i]) !== -1) return next()
          }
          return res.status(403).send('Your do not have sufficient permission to access this endpoint')
        }
      })
    }
    else if (config.debug) {
      next()
    }
    else {
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      })
    }
  }
}
