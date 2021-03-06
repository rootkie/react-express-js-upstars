const jwt = require('jsonwebtoken')

module.exports.hasRole = role => (req, res, next) => {
  const token = req.headers['x-access-token']
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: 'Failed to authenticate token.'
        })
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded
        const len = role.length
        for (let i = 0; i < len; i++) {
          if (req.decoded.roles.indexOf(role[i]) !== -1) return next()
        }
        return res.status(403).json({
          error: 'You do not have sufficient permission to access this endpoint'
        })
      }
    })
  } else if (process.env.NODE_ENV === 'development') {
    next()
  } else {
    // if there is no token
    // return an error
    return res.status(401).send({
      error: 'No token provided.'
    })
  }
}
