const User = require('../models/user')
const Class = require('../models/class')

module.exports.changeUserStatusAndPermissions = async (req, res, next) => {
  const { userId, newStatus, newRoles } = req.body
  try {
    let edited = {}
    let editedClass
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
      const error = {
        status: 404,
        error: 'User does not exist'
      }
      throw error
    }
    // Only if there is a change in status we then call the API to update the classes
    if (newStatus) {
      if (updatedUser.status === 'Active' && updatedUser.classes) {
        editedClass = await Class.updateMany({
          _id: {
            $in: updatedUser.classes
          }
        }, {
          $addToSet: {
            users: updatedUser._id
          }
        }, {
          new: true
        })
      } else if (updatedUser.status !== 'Active' && updatedUser.classes) {
        editedClass = await Class.updateMany({
          _id: {
            $in: updatedUser.classes
          }
        }, {
          $pull: {
            users: updatedUser._id
          }
        }, {
          new: true
        })
      }
    } else {
      editedClass = {'n': 1, 'nModified': 0, 'ok': 1}
    }

    // Returns necessary information
    return res.status(200).json({
      editedClass
    })
  } catch (err) {
    console.error(err)
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
    }).limit(100).select('name roles status').sort('name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getSuspendedPeople = async (req, res, next) => {
  try {
    // Find all people with status as Suspended
    const users = await User.find({
      'status': 'Suspended'
    }).limit(100).select('name roles status').sort('name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getDeletedPeople = async (req, res, next) => {
  try {
    // Find all people with status as Deleted
    const users = await User.find({
      'status': 'Deleted'
    }).limit(100).select('name roles status').sort('name').lean()
    res.status(200).json({
      users
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.multipleUserDelete = async (req, res, next) => {
  const { userId } = req.body
  try {
    // Check userId is provided
    if (!userId || userId.length === 0 || !userId.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please provide working userId(s)'
      }
      throw error
    }

    const userDeleted = await User.updateMany({
      '_id': {
        '$in': userId
      },
      status: {
        '$ne': 'Deleted'
      }
    }, {
      status: 'Deleted'
    })
    // If theres actually someone deleted, loop through and delete the userId from the classes each user is in
    if (userDeleted.n === 0) {
      const error = {
        status: 404,
        error: 'The user you requested to delete does not exist.'
      }
      throw error
    }
    for (let number = 0; number < userId.length; number++) {
      const userDetails = await User.findById(userId[number], 'classes')
      if (userDetails.classes) {
        await Class.updateMany({
          _id: {
            $in: userDetails.classes
          }
        }, {
          $pull: {
            users: userDetails._id
          }
        }, {
          new: true
        })
      }
    }
    res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.responsiveSearch = async (req, res, next) => {
  const { name } = req.params
  try {
    // Find all users with that name of whatever status
    const pendingMatched = await User.find({
      'status': 'Pending',
      'name': new RegExp(name, 'i')
    }).limit(50).select('name roles status').sort('name').lean()

    const activeMatched = await User.find({
      'status': 'Active',
      'name': new RegExp(name, 'i')
    }).limit(50).select('name roles status').sort('name').lean()

    const suspendedMatched = await User.find({
      'status': 'Suspended',
      'name': new RegExp(name, 'i')
    }).limit(50).select('name roles status').sort('name').lean()

    const deletedMatched = await User.find({
      'status': 'Deleted',
      'name': new RegExp(name, 'i')
    }).limit(50).select('name roles status').sort('name').lean()

    res.status(200).json({
      pendingMatched,
      activeMatched,
      suspendedMatched,
      deletedMatched
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
