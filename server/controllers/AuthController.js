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
    if (!user) {
      return res.status(403).send('Wrong email or password')
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      return res.status(403).send('Wrong email or password')
    }
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
    res.status(500).send('server error')
  }
}

module.exports.register = async(req, res) => {
  try {
    // All compulsory fields: Full test input with validation
    /*{	
    	"email": "test@gmail.com",
    	"password": "password",
    	"profile": {
    		"name": "Mr Student",
    		"gender": "M",
    		"dob": 123,
    		"nationality": "SG",
    		"nric": "S1102s",
    		"address": "Blk 999",
    		"postalCode": 122222,
    		"homephone": 123,
    		"handphone": 123,
    		"schoolName": "HCI",
    		"schoolClass": "2-3",
    		"schoolLevel": "J2"
    	},
    	"commencementDate": 123123,
    	"exitDate": 123,
    	"preferredTimeSlot": "Friday"
    }*/
    let {
      email,
      password,
      profile,
      commencementDate,
      exitDate,
      preferredTimeSlot
    } = req.body
      // Return error if no email provided
    if (!email) {
      return res.status(422).send({
        error: 'You must enter an email address.'
      })
    }

    // Return error if no password provided
    if (!password) {
      return res.status(422).send({
        error: 'You must enter a password.'
      })
    }

    const existingUser = await User.findOne({
      email
    })
    if (existingUser) return res.status(422).send({
      error: 'This email is already in use'
    })

    const user = new User({
      email,
      password,
      profile,
      commencementDate,
      exitDate,
      preferredTimeSlot,
      roles: ['Tutor']
    })
    const error = await user.validateSync();
    if (error) {
      console.log(error)
      return res.status(422).send('Error Saving: Fill in all required fields accurately')
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
    res.status(500).send(err.message)
  }
}

module.exports.simpleRegister = async (req, res) => {
  try {
    let { email, username, password } = req.body
    // Return error if no email provided
    if (!email) {
      return res.status(422).send({error: 'You must enter an email address.'})
    }

    // Return error if full name not provided
    if (!username) {
      return res.status(422).send({error: 'You must enter your full name.'})
    }

    // Return error if no password provided
    if (!password) {
      return res.status(422).send({ error: 'You must enter a password.' })
    }

    email = util.makeString(email)
    username = util.makeString(username)
    password = util.makeString(password)

    const existingUser = await User.findOne({email: email})
    if (existingUser) return res.status(422).send({error: 'This email is already in use'})
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
