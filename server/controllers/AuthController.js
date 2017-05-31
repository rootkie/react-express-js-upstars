const config = require('../config/constConfig')
const User = require('../models/user')
const util = require('../util.js')
const generateToken = util.generateToken
const makeUser = util.makeUser
// ============== Start of all the functions ==============

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

    const existingUser = await User.findOne({email})
    if (existingUser) return res.status(422).send({error: 'This email is already in use'})
    const user = new User({
      email,
      role: 'Tutor',
      profile: {
        name: name
      },
      password,
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
