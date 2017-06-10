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
    // Make all req body strings
    Object.keys(req.body).forEach(function (k) {
      req.body[k] = util.makeString(req.body[k])
    })

    let { email, name, password, dob, gender, nationality, nric, address, postalCode, handphone, homephone, schoolName, schoolLevel, schoolClass, careerGoal, commencementDate, exitDate } = req.body
    // Return error if no email provided
    if (!email) {
      return res.status(422).send({error: 'You must enter an email address.'})
    }

    // Return error if no password provided
    if (!password) {
      return res.status(422).send({ error: 'You must enter a password.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(422).send({error: 'This email is already in use'})

    const user = new User({
      email,
      password,
      profile: {
        name,
        gender,
        nationality,
        dob,
        nric,
        address,
        postalCode,
        handphone,
        homephone,
        schoolName,
        schoolLevel,
        schoolClass,
        careerGoal
      },
      commencementDate,
      exitDate,
      roles: ['Tutor']
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
    res.status(500).send(err.message)
  }
}
