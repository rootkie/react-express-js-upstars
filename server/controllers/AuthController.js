const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

function generateToken (user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 3600 // 1 hour
  })
}

function makeUser (req) {
  const { _id, email, role, profile } = req
  const { firstName, lastName } = profile
  return { _id, firstName, lastName, role, email }
}

function makeString(obj){
	return (typeof(obj) == 'string') ? obj : JSON.stringify(obj);
}

module.exports.login = async (req, res) => {
  try {
    let { password, email } = req.body
    // get user
	password = makeString(password)
	email = makeString(email)
    const user = await User.findOne({email})
    if (!user) {
      return res.status(403).send('Wrong email or password')
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      return res.status(403).send('Wrong email or password')
    }
    const userInfo = makeUser(user)
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

module.exports.register = function (req, res) {
  let { email, firstName, lastName, password } = req.body
  // Return error if no email provided
  if (!email) {
    return res.status(422).send({error: 'You must enter an email address.'})
  }

  // Return error if full name not provided
  if (!firstName || !lastName) {
    return res.status(422).send({error: 'You must enter your full name.'})
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: 'You must enter a password.' })
  }

  email = makeString(email)
  firstName = makeString(firstName)
  lastName = makeString(lastName)
  password = makeString(password)
  
  User.findOne({email: email}, function (err, exisitingUser) {
    if (err) {
      return res.status(500).send({ error: 'db something wrong' })
    }
    if (exisitingUser) {
      return res.status(422).send({error: 'This email is already in use'})
    }
    // no errors, create new user
    let user = new User({
      email: email,
      profile: {
        firstName: firstName,
        lastName: lastName
      },
      password: password
    })

    user.save(function (err, user) {
      if (err) {
        return res.status(500).send({error: 'db something wrong'})
      }
      // generate tokens
      let userInfo = makeUser(user)
      res.json({
        token: generateToken(userInfo),
        user: userInfo,
        status: 'success'
      })
    })
  })
}
