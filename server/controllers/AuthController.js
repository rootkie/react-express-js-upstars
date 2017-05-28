const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const util = require('../util.js')
// ============== Start of all the functions ==============

function generateToken (user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 3600 // 1 hour
  })
}

// Just leaving this here as the profile field might have other non-necessary stuff and need to form a custom token
// Else this function is currently useless
function makeUser (req) {
  const { _id, email, role, profile } = req
  return { _id, profile, role, email }
}

module.exports.login = async (req, res) => {
  try {
    let { password, email } = req.body
    // get user
    password = util.makeString(password)
    email = util.makeString(email)
    const user = await User.findOne({email})
    if (!user) {
      return res.status(403).send('Wrong email or password')
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      return res.status(403).send('Wrong email or password')
    }
    const userInfo = await makeUser(user)
    res.json({
      token: generateToken(userInfo),
      user: userInfo,
      status: 'success'
    })
    // End of try block, catch err
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.register = async (req, res) => {
  try {
    let { email, name, password } = req.body
    // Return error if no email provided
    if (!email) {
      return res.status(422).send({error: 'You must enter an email address.'})
    }

    // Return error if no password provided
    if (!password) {
      return res.status(422).send({ error: 'You must enter a password.' })
    }

    email = util.makeString(email)
    name = util.makeString(name)
    password = util.makeString(password)

    const existingUser = await User.findOne({email: email})
    if (existingUser) return res.status(422).send({error: 'This email is already in use'})
    const user = new User({
      email: email,
      role: 'Tutor',
      profile: {
        name: name
      },
      password: password,
    })
    const userObject = await user.save()
    const userInfo = makeUser(userObject)
    res.json({
      status: 'success',
      token: generateToken(userInfo),
      user: userInfo
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
