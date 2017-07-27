const User = require('../models/user')
const util = require('../util.js')
const generateToken = util.generateToken
const makeUser = util.makeUser

module.exports.login = async(req, res, next) => {
  try {
    let {
      password,
      email
    } = req.body

    if (!email) throw ({
      status: 400,
      error: 'Please provide an email address.'
    })

    // Return error if no password provided
    if (!password) throw ({
      status: 400,
      error: 'Please provide a password.'
    })

    const user = await User.findOne({
      email
    })

    // Checks if user exists
    if (!user) throw ({
        status: 401,
        error: 'Wrong email or password'
      })
      // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) throw ({
      status: 401,
      error: 'Wrong email or password'
    })

    res.json({
      token: generateToken(user),
      _id: user._id,
      email: user.email,
      roles: user.roles,
      name: user.profile.name
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
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

    // Return error if no email provided
    if (!email) throw ({
      status: 400,
      error: 'Please provide an email address.'
    })

    // Return error if no password provided
    if (!password || password.length < 6) throw ({
      status: 400,
      error: 'Please provide a password that is at least 6 characters long.'
    })

    // Find the user based on email
    const existingUser = await User.findOne({
      email
    })
    if (existingUser) throw {
      status: 409,
      error: 'Email already exists.'
    }

    // Create a new user after validating
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

    res.json({
      status: 'success',
      token: generateToken(userObject),
      _id: userObject._id,
      email: userObject.email,
      roles: userObject.roles,
      name: userObject.profile.name
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
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
    if (!email) throw ({
      status: 400,
      error: 'Please provide an email address.'
    })

    // Return error if no password provided
    if (!password) throw ({
      status: 400,
      error: 'Please provide a password.'
    })

    // Return error if full name not provided
    if (!username) throw ({
      status: 400,
      error: 'Please provide a username.'
    })

    const existingUser = await User.findOne({
      email: email
    })
    if (existingUser) throw ({
      status: 409,
      error: 'Email already exists.'
    })

    const user = new User({
      email: email,
      profile: {
        username
      },
      password: password
    })
    const userObject = await user.save()
    const userInfo = makeUser(userObject)
    res.json({
      status: 'success',
      token: generateToken(userInfo),
      user: userInfo
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}
