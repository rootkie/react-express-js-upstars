const User = require('../models/user')
const util = require('../util.js')
const generateToken = util.generateToken
const makeUser = util.makeUser
  // ============== Start of all the functions ==============

module.exports.login = async(req, res) => {
  try {
    let {
      password,
      email
    } = req.body

    const user = await User.findOne({
      email
    })
    if (!user) throw { code: 403, message: 'Wrong email or password' }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) throw { code: 403, message: 'Wrong email or password' }
    res.json({
      token: generateToken(user),
      _id: user._id,
      email: user.email,
      roles: user.roles,
      name: user.profile.name
    })
  } catch (err) {
    console.log(err)
    if (err.code === 403) return res.status(403).send(err.message)
    else return res.status(500).send('server error')
  }
}

module.exports.register = async(req, res) => {
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
    if (!email) throw { code: 400, message: 'You must enter an email address.' }

    // Return error if no password provided
    if (!password) throw { code: 400, message: 'You must enter a password.' }

    const existingUser = await User.findOne({
      email
    })
    if (existingUser) throw { code: 400, message: 'This email is already in use' }

    const user = new User({
      email,
      password,
      profile,
      commencementDate,
      exitDate,
      preferredTimeSlot,
      roles: ['Tutor']
    })
    const error = await user.validateSync()
    if (error) {
      console.log(error)
      throw { code: 400, message: 'Error Saving: Fill in all required fields accurately'}
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
  } catch (err) {
    console.log(err)
    if (err.code === 400) return res.status(400).send(err.message)
    else return res.status(500).send('server error')
  }
}

module.exports.simpleRegister = async (req, res) => {
  try {
    let { email, username, password } = req.body
    // Return error if no email provided
    if (!email) {
      return res.status(400).send({error: 'You must enter an email address.'})
    }

    // Return error if full name not provided
    if (!username) {
      return res.status(400).send({error: 'You must enter your full name.'})
    }

    // Return error if no password provided
    if (!password) {
      return res.status(400).send({ error: 'You must enter a password.' })
    }

    const existingUser = await User.findOne({email: email})
    if (existingUser) return res.status(400).send({error: 'This email is already in use'})
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
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
