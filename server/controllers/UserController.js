const User = require('../models/user')
const External = require('../models/external-personnel')

module.exports.getAllUsers = async(req, res, next) => {
  try {
    // Retrieve all users in the system
    const users = await User.find({}).select('profile.name').sort('profile.name')
    res.json({
      users
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

module.exports.getUser = async(req, res, next) => {
  try {
    sudo = false
      // Check for Admin / SuperAdmin / Mentor
    if (req.decoded.roles.indexOf('Admin') !== -1 || req.decoded.roles.indexOf('SuperAdmin') !== -1 || req.decoded.roles.indexOf('Mentor') !== -1) {
      sudo = true
    }

    // Check if user has admin rights and is only querying their own particulars
    if (req.params.id !== req.decoded._id && sudo == false) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    // Find user based on ID and retrieve its className
    const user = await User.findById(req.params.id).populate('classes', 'className').select('-password -updatedAt -createdAt')
    res.json({
      user
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

module.exports.editUserParticulars = async(req, res, next) => {
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

    // Check userId is provided
    if (!userId) throw ({
      status: 400,
      error: 'Please provide a userId'
    })

    // Only allows user to edit their own particulars unless they are admin
    if (userId !== req.decoded._id && sudo == false) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    // If admin is editing, they can also edit the admin field
    if (sudo) {
      if (req.body.admin) {
        edited['admin'] = req.body.admin
      }
    }
    const list = ['profile', 'father', 'mother', 'misc', 'exitDate', 'preferredTimeSlot']

    // Go through list
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    // Update user based on the new values
    const user = await User.findByIdAndUpdate(userId, edited, {
      new: true,
      runValidators: true,
      runSettersOnQuery: true
    }).select('-password -updatedAt -createdAt')

    res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      res.status(400).send('There is something wrong with the client input. That is all we know.')
    }
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}

module.exports.deleteUser = async(req, res, next) => {
  let {
    userId
  } = req.body
  try {
    // Check userId is provided
    if (!userId) throw ({
      status: 400,
      error: 'Please provide a userId'
    })

    // Delete user from database
    const userDeleted = await User.findByIdAndRemove(userId).select('-password')
    return res.json({
      userDeleted
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

module.exports.changePassword = async(req, res, next) => {
  try {
    let {
      userId,
      oldPassword,
      newPassword
    } = req.body

    // Check userId or passwords are provided
    if (!userId || !oldPassword || !newPassword) throw ({
      status: 400,
      error: 'Please provide userId, old password and new password'
    })

    // Find the user and match his password hash
    const user = await User.findById(userId)
    const isMatch = await user.comparePasswordPromise(oldPassword)
    if (!isMatch) throw ({
      status: 401,
      error: 'Old password does not match. Please try again'
    })

    // Prevent people from changing passwords of someone else even if they know his password
    if (userId !== req.decoded._id) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    // Save the new user password
    user.password = newPassword
    const pwChanged = await user.save()
    if (pwChanged) {
      res.json({
        status: 'success'
      })
    }
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


module.exports.getExternal = async(req, res, next) => {
  try {
    // Find the external and get className
    const user = await External.findById(req.params.id).populate('classId', 'className')
    res.json({
      user
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}
