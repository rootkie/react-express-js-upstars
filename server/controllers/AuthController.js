const User = require('../models/user')
const util = require('../util.js')
const generateToken = util.generateToken
const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
// ============== Start of all the functions ==============
// Everyone can access without token

module.exports.login = async(req, res, next) => {
  try {
    let {
      password,
      email
    } = req.body
    if (!email || !password) {
      throw ({
        status: 400,
        error: 'Please provide an email address and password.'
      })
    }

    // Search for any users whose accounts are not yet deleted
    const user = await User.findOne({
      email,
      status: {
        $ne: 'Deleted'
      }
    })

    // Checks if user exists
    if (!user) {
      throw ({
        status: 404,
        error: 'Wrong email. Please sign up for an account here'
      })
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      throw ({
        status: 401,
        error: 'Wrong email or password'
      })
    }
    if (user.status === 'Suspended') {
      throw ({
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      })
    }

    res.json({
      token: generateToken(user),
      _id: user._id,
      email: user.email,
      roles: user.roles,
      name: user.profile.name
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.register = async(req, res, next) => {
  try {
    let {
      email,
      password,
      profile,
      commencementDate,
      exitDate,
      preferredTimeSlot
    } = req.body

    // Return error if no password or email provided
    if (!email || !password || password.length < 6) {
      throw ({
        status: 400,
        error: 'Please provide an email and password that is also at least 6 characters long.'
      })
    }

    // Find the user based on email
    const existingUser = await User.findOne({
      email
    })
    // 3 cases:
    // case 1: Email exists and user is legitimate
    if (existingUser && existingUser.status !== 'Deleted' && existingUser.status !== 'Suspended') {
      throw {
        status: 409,
        error: 'Email already exists.'
      }
    }
    // case 2: user has a bad record and is suspended
    if (existingUser && existingUser.status === 'Suspended') {
      throw {
        status: 403,
        error: 'Your account has been suspended. Please contact the administrator for follow up actions'
      }
    }
    // case 3: user is deleted by admin or by oneself
    // If user choose to create a new account after deleting, the old records preserved will be changed while the ID remains and
    // a new account would be made. Else the user always have the ability to ask the admin to restore their account.
    // This case, the passwords and emails are changed to follow a unique string. It is not restorable but nonetheless traceable in past attendance records.
    // Using the native crypto package, we generate true random strings to add to email and password so they are really gone.
    if (existingUser && existingUser.status === 'Deleted') {
      existingUser.email = crypto.randomBytes(4).toString('hex') + 'deleted' + existingUser._id + '@upstars.com'
      existingUser.password = existingUser._id + crypto.randomBytes(5).toString('hex')
      existingUser.status = 'PermaDeleted'
      await existingUser.save()
    }

    // Create a new user after validating and making sure everything is right
    const user = new User({
      email,
      password,
      profile,
      commencementDate: util.formatDate(commencementDate),
      exitDate: util.formatDate(exitDate),
      preferredTimeSlot,
      roles: ['Tutor']
    })
    const error = await user.validateSync()
    if (error) {
      throw {
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      }
    }
    const userObject = await user.save()
    res.status(201).json({
      status: 'success',
      token: generateToken(userObject),
      _id: userObject._id,
      email: userObject.email,
      roles: userObject.roles,
      name: userObject.profile.name
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.check = async(req, res, next) => {
  try {
    let token = req.headers['x-access-token']
    let result = (auth) => {
      return res.status(200).json({
        auth
      })
    }
    if (!token) return result(false)
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return result(false)
      } else {
        return result(true)
      }
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.simpleRegister = async(req, res, next) => {
  try {
    let {
      email,
      username,
      password
    } = req.body

    // Return error if no email provided
    if (!email) {
      throw ({
        status: 400,
        error: 'Please provide an email address.'
      })
    }

    // Return error if no password provided
    if (!password) {
      throw ({
        status: 400,
        error: 'Please provide a password.'
      })
    }

    // Return error if full name not provided
    if (!username) {
      throw ({
        status: 400,
        error: 'Please provide a username.'
      })
    }

    const existingUser = await User.findOne({
      email: email
    })
    if (existingUser) {
      throw ({
        status: 409,
        error: 'Email already exists.'
      })
    }

    const user = new User({
      email: email,
      profile: {
        name: username
      },
      password: password
    })
    const userObject = await user.save({
      validateBeforeSave: false
    })
    delete userObject.password // this is a temporary hack.
    console.log(userObject)
    res.json({
      status: 'success',
      token: generateToken(userObject),
      user: userObject
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}