const User = require('../models/user')
const util = require('../util')
const Class = require('../models/class')
const nodemailer = require('nodemailer')

// All
module.exports.getAllUsers = async (req, res, next) => {
  try {
    let { roles, _id } = req.decoded
    // Retrieve all users in the system based on roles and permissions
    if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || roles.indexOf('Mentor') !== -1) {
      const users = await User.find({
        'status': 'Active'
      }).select('profile.name profile.nric profile.gender profile.dob roles status').sort('profile.name')

      return res.status(200).json({
        users
      })
    } else {
      const users = await User.find({
        '_id': _id,
        'status': 'Active'
      }).select('profile.name profile.nric profile.gender profile.dob roles status').sort('profile.name')

      return res.status(200).json({
        users
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

// Everyone but restricted to their own profile checked using token. Only Admin and above can view all.
module.exports.getUser = async (req, res, next) => {
  try {
    let user
    let approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: req.params.id,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved.auth === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Find user based on ID and retrieve its className. Restrict based on the need to view admin
    // The first check on top is to make sure the user has permission to view the profile of that ID at all
    // This next check is to ensure that a non-admin viewing his personal profile won't get to edit / view admin matters
    if (approved.privilege === false) {
      user = await User.findById(req.params.id).populate('classes', 'className status').select('-password -updatedAt -createdAt -admin -commencementDate -email -resetPasswordToken')
    } else {
      user = await User.findById(req.params.id).populate('classes', 'className status').select('-password -updatedAt -createdAt -commencementDate -email -resetPasswordToken')
    }
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
    if (approved.auth === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    const list = ['profile', 'father', 'mother', 'misc', 'exitDate', 'preferredTimeSlot']

    // Go through list
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    if (approved.privilege === true) {
      edited.admin = await req.body.admin
    }

    let user = await User.findById(userId)
    user.set(edited)
    const rawUser = await user.save()
    // ES7 Spread for Object destructuring
    let { password, createdAt, updatedAt, __v, resetPasswordToken, email, ...editedUser } = rawUser.toObject()
    if (approved.privilege !== true) {
      delete editedUser.admin
    }
    if (!user) {
      throw ({
        status: 404,
        error: 'The user you requested to edit does not exist.'
      })
    }
    // console.log(editedUser)
    return res.status(200).json({
      user: editedUser
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
  try {
    // Check userId is provided
    if (!(/^[0-9a-fA-F]{24}$/).test(userId)) {
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
    if (approved.auth === false) {
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
      await Class.updateMany({
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

// Change your own password
module.exports.changePassword = async (req, res, next) => {
  try {
    let {
      userId,
      oldPassword,
      newPassword
    } = req.body

    // Check userId or passwords are provided
    if (!(/^[0-9a-fA-F]{24}$/).test(userId) || !oldPassword || !newPassword || newPassword.length < 6) {
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
      // Send back to confirm first. Email comes later.
      res.status(200).send()
      let mailConfig
      if (process.env.NODE_ENV === 'production') {
      // all emails delivered to real address
        mailConfig = {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: process.env.USER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
          }
        }
      } else {
      // all emails caught by nodemailer in house ethereal.email service
      // Login with the user and pass in https://ethereal.email/login to view the message
        mailConfig = {
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.TEST_EMAIL,
            pass: process.env.TEST_EMAIL_PW
          }
        }
      }
      let transporter = nodemailer.createTransport(mailConfig)
      let message = {
        from: process.env.USER,
        to: user.email,
        subject: 'UP Stars Password Changed',
        html: `<p>What's up ${user.profile.name}!</p><p>You've asked us to update your password and we want to let you know that it has been
          updated. You can use your new password to log in now!</p><p>If you didn't ask us to change it, please let us know.</p><p>Thanks,<br />The UP Stars Team</p>`
      }
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(error)
        }
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

// All
module.exports.getUsersByName = async (req, res, next) => {
  try {
    let { roles, _id } = req.decoded
    let { name } = req.params
    // Retrieve users in the system based on roles and permissions
    if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || roles.indexOf('Mentor') !== -1) {
      const users = await User.find({
        'status': 'Active',
        'profile.name': new RegExp(name, 'i')
      }).select('profile.name').sort('profile.name')

      return res.status(200).json({
        users
      })
    } else {
      const users = await User.find({
        '_id': _id,
        'status': 'Active'
      }).select('profile.name').sort('profile.name')

      return res.status(200).json({
        users
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
