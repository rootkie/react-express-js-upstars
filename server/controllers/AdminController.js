const User = require('../models/user')
const Class = require('../models/class')

module.exports.changeUserStatusAndPermissions = async (req, res, next) => {
  try {
    let {
      userId,
      newStatus,
      newRoles
    } = req.body
    let edited = {}
    let editedClass
    // Check if these fields exist, if it does it will get updated in the database
    if (newStatus) {
      edited.status = newStatus
    }
    if (newRoles) {
      edited.roles = newRoles
    }
    // Update it on the database with validations
    const updatedUser = await User.findByIdAndUpdate(userId, edited, {
      new: true,
      runValidators: true
    })
    if (!updatedUser) {
      throw ({
        status: 404,
        error: 'User does not exist'
      })
    }
    // Add the user back to the previous classes if admin restores Suspended or Deleted Account.
    // Else, the user would be deleted from the respective classes if they are suspended or deleted.
    if (updatedUser.status === 'Active' && updatedUser.classes) {
      editedClass = await Class.update({
        _id: {
          $in: updatedUser.classes
        }
      }, {
        $addToSet: {
          users: updatedUser._id
        }
      }, {
        new: true,
        multi: true
      })
    } else if (updatedUser.classes) {
      editedClass = await Class.update({
        _id: {
          $in: updatedUser.classes
        }
      }, {
        $pull: {
          users: updatedUser._id
        }
      }, {
        new: true,
        multi: true
      })
    }

    // Returns necessary information
    return res.status(200).json({
      editedClass
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

module.exports.getPendingUsers = async (req, res, next) => {
  try {
    // Find all users with status as Pending
    const users = await User.find({
      'status': 'Pending'
    }).limit(100).select('profile.name roles status').sort('profile.name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getSuspendedPeople = async (req, res, next) => {
  try {
    // Find all people with status as Suspended
    const users = await User.find({
      'status': 'Suspended'
    }).limit(100).select('profile.name roles status').sort('profile.name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getDeletedPeople = async (req, res, next) => {
  try {
    // Find all people with status as Suspended
    const users = await User.find({
      'status': 'Deleted'
    }).limit(100).select('profile.name roles status').sort('profile.name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.multipleUserDelete = async (req, res, next) => {
  let {
    userId
  } = req.body
  try {
    // Check userId is provided
    if (!userId || userId.length === 0 || !(/^[0-9a-fA-F]{24}$/).test(userId)) {
      throw ({
        status: 400,
        error: 'Please provide a userId and ensure input is correct'
      })
    }

    // Delete user from database
    // Find a user whose status is not previously deleted to change it to delete (Note: $ne == not equals)
    const userDeleted = await User.update({
      '_id': {
        '$in': userId
      },
      status: {
        '$ne': 'Deleted'
      }
    }, {
      status: 'Deleted'
    }, {
      multi: true
    })
    // If theres actually someone deleted, loop through and delete the userId from the respective classes so that the population of the class would
    // go well. Once the status of the user is changed back to Active, the classes of the user would be automatically restored. Even if the user
    // is really deleted and a new account is created, the system would not crash.
    if (userDeleted.n === 0) {
      throw ({
        status: 404,
        error: 'The user you requested to delete does not exist.'
      })
    } else {
      for (let number = 0; number < userId.length; number++) {
        let userDetails = await User.findById(userId[number], 'classes')
        if (userDetails.classes) {
          await Class.update({
            _id: {
              $in: userDetails.classes
            }
          }, {
            $pull: {
              users: userDetails._id
            }
          }, {
            new: true,
            multi: true
          })
        }
      }
    }
    return res.status(200).send()
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.responsiveSearch = async (req, res, next) => {
  let { name } = req.params
  try {
    // Find all users with that name of whatever status
    const pendingMatched = await User.find({
      'status': 'Pending',
      'profile.name': new RegExp(name, 'i')
    }).limit(50).select('profile.name roles status').sort('profile.name').lean()

    const activeMatched = await User.find({
      'status': 'Active',
      'profile.name': new RegExp(name, 'i')
    }).limit(50).select('profile.name roles status').sort('profile.name').lean()

    const suspendedMatched = await User.find({
      'status': 'Suspended',
      'profile.name': new RegExp(name, 'i')
    }).limit(50).select('profile.name roles status').sort('profile.name').lean()

    const deletedMatched = await User.find({
      'status': 'Deleted',
      'profile.name': new RegExp(name, 'i')
    }).limit(50).select('profile.name roles status').sort('profile.name').lean()

    res.status(200).json({
      pendingMatched,
      activeMatched,
      suspendedMatched,
      deletedMatched
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
