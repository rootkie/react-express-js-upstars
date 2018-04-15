const User = require('../models/user')
const External = require('../models/external-personnel')
const util = require('../util')
const Class = require('../models/class')

// Admin / SA
module.exports.getAllUsers = async (req, res, next) => {
  try {
    // Retrieve all users in the system
    const users = await User.find({
      'status': 'Active'
    }).select('profile roles status').sort('profile.name')

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

module.exports.otherUsers = async (req, res, next) => {
  try {
    // Retrieve all users in the system that have status other than "Active"
    const usersPending = await User.find({
      'status': 'Pending'
    }).select('profile roles').sort('profile.name')

    const usersOthers = await User.find({
      $nor: [
        {
          'status': 'Active'
        }, {
          'status': 'Pending'
        }
      ]
    }).select('profile roles status').sort('profile.name status')

    return res.status(200).json({
      usersPending,
      usersOthers
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

// Everyone but restricted to their own class checked using token
module.exports.getUser = async (req, res, next) => {
  try {
    let approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: req.params.id,
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
    const user = await User.findById(req.params.id).populate('classes', 'className status').select('-password -updatedAt -createdAt')
    if (!user) {
      throw ({
        status: 404,
        error: 'User does not exist. Please try again'
      })
    }
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

// Same logic, everyone can access their own stuff
module.exports.editUserParticulars = async (req, res, next) => {
  try {
    let {
      userId
    } = req.body
    // Check userId is provided
    if (!userId) {
      throw ({
        status: 400,
        error: 'Please provide a userId'
      })
    }

    let edited = {}
    let approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: userId,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    const list = ['profile', 'father', 'mother', 'misc', 'exitDate', 'preferredTimeSlot', 'status']

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

    if (!user) {
      throw ({
        status: 404,
        error: 'The user you requested to edit does not exist.'
      })
    }

    if (user.status === 'Active' && user.classes) {
      await Class.update({
        _id: {
          $in: user.classes
        }
      }, {
        $addToSet: {
          students: user._id
        }
      }, {
        new: true,
        multi: true
      })
    } else if (user.classes) {
      // If status if changed to anything other than Active, we will delete their IDs from the classes instead
      await Class.update({
        _id: {
          $in: user.classes
        }
      }, {
        $pull: {
          students: user._id
        }
      }, {
        new: true,
        multi: true
      })
    }
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

// Everyone
module.exports.deleteUser = async (req, res, next) => {
  let {
    userId
  } = req.body
  let editedClass = null
  try {
    // Check userId is provided
    if (!userId) {
      throw ({
        status: 400,
        error: 'Please provide a userId and ensure input is correct'
      })
    }
    let approved = await util.checkRole({
      roles: ['SuperAdmin'],
      params: userId,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Delete user from database
    // Find a user whose status is not previously deleted to change it to delete (Note: $ne == not equals)
    const userDeleted = await User.findOneAndUpdate({
      '_id': userId,
      status: {
        '$ne': 'Deleted'
      }
    }, {
      status: 'Deleted'
    }).select('profile.name classes')
    if (!userDeleted) {
      throw ({
        status: 404,
        error: 'The user you requested to delete does not exist.'
      })
    }
    // If the user is in any classes, delete the user from the class so that the population would not fail. Upon restoring of their status (if necessary)
    // their classes would be re populated.
    if (userDeleted.classes) {
      editedClass = await Class.update({
        _id: {
          $in: userDeleted.classes
        }
      }, {
        $pull: {
          users: userDeleted._id
        }
      }, {
        new: true,
        multi: true
      })
    }
    return res.status(200).json({
      status: 'success',
      userDeleted,
      editedClass
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

// Change your own password
module.exports.changePassword = async (req, res, next) => {
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

    // Find the user and match his password hash
    const user = await User.findById(userId)
    if (!user) {
      throw ({
        status: 400,
        error: 'User does not exist!'
      })
    }
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

// Admin / SA
// Note that external is the only party we conduct a permanent delete
module.exports.getExternal = async (req, res, next) => {
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
