const User = require('../models/user')
const External = require('../models/external-personnel')

module.exports.getAllUsers = async(req, res) => {
  try {
    const users = await User.find({}).select('profile.name').sort('profile.name')
    return res.json({
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
    
    sudo = false
      // Check for Admin / SuperAdmin / Mentor
    if (req.decoded.roles.indexOf('Admin') !== -1 || req.decoded.roles.indexOf('SuperAdmin') !== -1 || req.decoded.roles.indexOf('Mentor') !== -1) {
      sudo = true
    }

    if (req.params.id !== req.decoded._id && sudo == false) {
      return res.status(403).send('Operation denied')
    }

    const user = await User.findById(req.params.id).populate('classes', 'className').select('-password -updatedAt -createdAt')
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
    sudo = false
      // Check for Admin / SuperAdmin / Mentor
    if (req.decoded.roles.indexOf('Admin') !== -1 || req.decoded.roles.indexOf('SuperAdmin') !== -1 || req.decoded.roles.indexOf('Mentor') !== -1) {
      sudo = true
    }

    if (!userId) {
      return res.status(400).send('Please provide a valid userId')
    }
    if (userId !== req.decoded._id && sudo == false) {
      return res.status(403).send('Operation denied')
    }
    if (sudo) {
      if (req.body.admin) {
        edited['admin'] = req.body.admin
      }
    }
    const list = ['profile', 'father', 'mother', 'misc', 'exitDate', 'preferredTimeSlot']
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    const user = await User.findByIdAndUpdate(userId, edited, {
      new: true,
      runValidators: true,
      runSettersOnQuery: true
    }).select('-password -updatedAt -createdAt')

    return res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      res.status(400).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    else res.status(500).send('server error')
  }
}

module.exports.deleteUser = async(req, res) => {
  let {
    userId
  } = req.body
  if (!userId) return res.status(400).send('userId is required')
  try {
    const userDeleted = await User.findByIdAndRemove(userId).select('-password')
    return res.json({
      userDeleted
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.changePassword = async(req, res) => {
  try {
    let {
      userId,
      oldPassword,
      newPassword
    } = req.body

    const user = await User.findById(userId)
    const isMatch = await user.comparePasswordPromise(oldPassword)
    if (!isMatch) {
      return res.status(403).send('Wrong Password')
    }
    
    if (userId !== req.decoded._id) {
      return res.status(403).send('Operation denied')
    }

    user.password = newPassword
    const pwChanged = await user.save()
    if (pwChanged) {
      return res.json({
        status: 'success'
      })
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}


module.exports.getExternal = async(req, res) => {
  try {
    const user = await External.findById(req.params.id).populate('classId', 'className')
    return res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
