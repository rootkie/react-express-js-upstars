const User = require('../models/user')
const External = require('../models/external-personnel')
const util = require('../util')

module.exports.getAllUsers = async(req, res, next) => {
  try {
    // Retrieve all users in the system
    const users = await User.find({}).select('profile roles status').sort('profile.name')

    return res.status(200).json({
      users
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getUser = async(req, res, next) => {
  try {
    let approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: req.params,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Find user based on ID and retrieve its className
    const user = await User.findById(req.params.id).populate('classes', 'className').select('-password -updatedAt -createdAt')
    return res.status(200).json({
      user
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.editUserParticulars = async(req, res, next) => {
  try {
    let {
      userId
    } = req.body

    let edited = {}
    let approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: req.params,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Check userId is provided
    if (!userId) {
      throw ({
        status: 400,
        error: 'Please provide a userId'
      })
    }

    // If admin is editing, they can also edit the admin field
    if (req.decoded.roles.indexOf('Admin') || req.decoded.roles.indexOf('SuperAdmin')) {
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

    return res.status(200).json({
      editedUser: user
    })
  } catch (err) {
    console.log(err)
    if (err.name === 'ValidationError') {
      res.status(400).send({
        error: 'There is something wrong with the client input. That is all we know.'
      })
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.deleteUser = async(req, res, next) => {
  let {
    userId
  } = req.body
  try {
    // Check userId is provided
    if (!userId || userId.indexOf('') !== -1) {
      throw ({
        status: 400,
        error: 'Please provide a userId and ensure input is correct'
      })
    }

    // Delete user from database
    const userDeleted = await User.remove({
      '_id': {
        '$in': userId
      }
    })

    return res.status(200).json({
      status: 'success',
      userDeleted
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
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
    if (!userId || !oldPassword || !newPassword || newPassword.length < 6) {
      throw ({
        status: 400,
        error: 'Please provide userId, old password and new password. Ensure password is at least 6 characters long.'
      })
    }
    // Prevent people from changing passwords of someone else even if they know his password
    if (userId !== req.decoded._id) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Find the user and match his password hash
    const user = await User.findById(userId)
    if (!user) throw ({
      status: 401,
      error: 'User does not exist!'
    })
    const isMatch = await user.comparePasswordPromise(oldPassword)
    if (!isMatch) {
      throw ({
        status: 401,
        error: 'Old password does not match. Please try again'
      })
    }
    // Save the new user password
    user.password = newPassword
    const pwChanged = await user.save()
    if (pwChanged) {
      return res.status(200).json({
        status: 'success'
      })
    }
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getExternal = async(req, res, next) => {
  try {
    // Find the external and get className
    const user = await External.findById(req.params.id).populate('classId', 'className')
    return res.status(200).json({
      user
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}