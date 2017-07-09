const User = require('../models/user')
const External = require('../models/external-personnel')
let util = require('../util.js')

module.exports.getAllUsers = async(req, res) => {
  try {
    const users = await User.find({})
    res.json({
      users
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getUser = async(req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('classes', 'className')
    res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.editUserParticulars = async(req, res) => {
  try {
    let {
      userId
    } = req.body

    let edited = {}

    if (!userId) {
      res.status(422).send('Please provide a valid userId')
    }
    if (userId !== req.decoded._id && req.decoded.roles.indexOf('Admin') == -1) {
      res.status(403).send('Operation denied')
    }
    if (req.decoded.roles.indexOf('Admin') != -1) {
      if (req.body.admin) {
        edited['admin'] = req.body.admin
      }
    }
    const list = ['profile', 'father', 'mother', 'misc', 'exitDate', 'preferredTimeSlot'] //email is left out because unique: true is not a validator. Only works on create.

    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    const user = await User.findByIdAndUpdate(userId, edited, {
      new: true,
      runValidators: true,
      runSettersOnQuery: true
    })

    return res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      res.status(422).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    else res.status(500).send('server error')
  }
}


module.exports.changePassword = async(req, res) => {
  try {
    let {
      userId,
      oldPassword,
      newPassword,
      confirmNewPassword
    } = req.body
      // Just in case the front end screws up
    if (newPassword !== confirmNewPassword) {
      return res.status(422).json({
        error: 'The 2 new passwords do not match'
      })
    }

    const user = await User.findById(userId)
    const isMatch = await user.comparePasswordPromise(oldPassword)
    if (!isMatch) {
      return res.status(403).send('Wrong Password')
    }

    // Did not return the token. Pls add in so its standardised. I dont want to add the wrong things
    user.password = confirmNewPassword
    const pwChanged = await user.save()
    return res.json({
      user: pwChanged
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}


module.exports.getExternal = async(req, res) => {
  try {
    const user = await External.findById(req.params.id).populate('classId', 'className')
    res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
