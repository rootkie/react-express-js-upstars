const User = require('../models/user')
const util = require('../util')
const Class = require('../models/class')
const nodemailer = require('nodemailer')

// All
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const { roles, _id } = req.decoded
    // Retrieve all users in the system based on roles and permissions
    if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || roles.indexOf('Mentor') !== -1) {
      const users = await User.find({
        'status': 'Active'
      }).select('name nric gender dob roles status').sort('name')

      return res.status(200).json({
        users
      })
    } else {
      const users = await User.find({
        _id,
        'status': 'Active'
      }).select('name nric gender dob roles status')

      return res.status(200).json({
        users
      })
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
}

// Everyone but restricted to their own profile, verified using token. Only Admin and above can view all.
module.exports.getUser = async (req, res, next) => {
  try {
    const approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: req.params.id,
      decoded: req.decoded
    })
    // Check if user is only accessing their own particulars. Admin and above always returns a true.
    if (approved.auth === false) {
      const error = {
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      }
      throw error
    }

    // Find user based on ID and retrieve its className. Restricted based on the need to view admin
    // Since the auth check above already confirmed the user can view this profile, the privilege checks if the user can see (and edit) admin field
    let user = await User.findById(req.params.id).populate('classes', 'className status')
      .select('-password -commencementDate -email -resetPasswordToken')
    if (!user) {
      const error = {
        status: 404,
        error: 'User does not exist. Please try again'
      }
      throw error
    }
    if (approved.privilege === false) {
      delete user.admin
    }
    return res.status(200).json({
      user
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Everyone can only access their own stuff
module.exports.editUserParticulars = async (req, res, next) => {
  try {
    const { userId } = req.body
    // Check userId is provided
    if (!(/^[0-9a-fA-F]{24}$/).test(userId)) {
      const error = {
        status: 400,
        error: 'Please provide a userId'
      }
      throw error
    }

    let edited = {}
    const approved = await util.checkRole({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: userId,
      decoded: req.decoded
    })
    // Check if user is only querying their own particulars. Admin and above always return true.
    if (approved.auth === false) {
      const error = {
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      }
      throw error
    }

    const properties = ['address', 'postalCode', 'handphone', 'homephone', 'schoolLevel', 'schoolClass', 'fatherName', 'fatherOccupation', 'fatherEmail', 'motherName', 'motherOccupation', 'motherEmail', 'hobbies', 'careerGoal', 'formalEducation', 'coursesSeminar', 'achievements', 'cca', 'cip', 'workInternExp', 'languages', 'subjects', 'interests', 'purposeObjectives', 'developmentGoals', 'exitDate', 'preferredTimeSlot']

    // Go through list
    for (let checkChanged of properties) {
      // if (req.body[checkChanged]) {
      edited[checkChanged] = req.body[checkChanged]
      // }
    }
    // Provilege is to check if user can view and edit admin related fields
    if (approved.privilege === true) {
      edited.admin = await req.body.admin
    }

    let user = await User.findById(userId)
    // const userDetails = {
    //   ...user,
    //   edited
    // }
    // console.log(userDetails)
    user.set(edited)
    const rawUser = await user.save()

    if (!user) {
      const error = {
        status: 404,
        error: 'The user you requested to edit does not exist.'
      }
      throw error
    }
    // ES7 Spread for Object destructuring
    let { password, resetPasswordToken, email, ...editedUser } = rawUser.toObject()
    if (approved.privilege !== true) {
      delete editedUser.admin
    }

    return res.status(200).json({
      user: editedUser
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

// Everyone
module.exports.deleteUser = async (req, res, next) => {
  const { userId } = req.body
  try {
    // Check userId is provided
    if (!(/^[0-9a-fA-F]{24}$/).test(userId)) {
      const error = {
        status: 400,
        error: 'Please provide a userId and ensure input is correct'
      }
      throw error
    }
    const approved = await util.checkRole({
      roles: ['SuperAdmin'],
      params: userId,
      decoded: req.decoded
    })
    // Check if user has either admin rights or is only querying their own particulars
    if (approved.auth === false) {
      const error = {
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      }
      throw error
    }

    // Find a user whose status is not previously deleted and change it to delete (Note: $ne == not equals)
    const userDeleted = await User.findOneAndUpdate({
      '_id': userId,
      status: {
        '$ne': 'Deleted'
      }
    }, {
      status: 'Deleted'
    }).select('name classes')
    if (!userDeleted) {
      const error = {
        status: 404,
        error: 'The user you requested to delete does not exist.'
      }
      throw error
    }
    // If the user is in any classes, delete the user from the class so that the population would not fail.
    // Upon restoring of their status (if necessary), their classes would be re populated.
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

// Change your own password
module.exports.changePassword = async (req, res, next) => {
  try {
    const { userId, oldPassword, newPassword } = req.body

    // Check userId or passwords are provided
    if (!(/^[0-9a-fA-F]{24}$/).test(userId) || !oldPassword || !newPassword || newPassword.length < 6) {
      const error = {
        status: 400,
        error: 'Please provide userId, old password and new password. Ensure password is at least 6 characters long.'
      }
      throw error
    }

    // Find the user and match his password hash
    const user = await User.findById(userId)
    if (!user) {
      const error = {
        status: 400,
        error: 'User does not exist!'
      }
      throw error
    }
    const isMatch = await user.comparePasswordPromise(oldPassword)
    if (!isMatch) {
      const error = {
        status: 401,
        error: 'Your old password does not match. Please try again'
      }
      throw error
    }
    // Save the new user password if no errors are thrown. save() will initiate a hook to automatically hash the password
    user.password = newPassword
    const pwChanged = await user.save()
    if (pwChanged) {
      // Send back to confirm first. Email comes later.
      res.status(200).send()
      // Assume PRODUCTION first. Will change only if it is a production server
      // all emails delivered to real address
      let mailConfig = {
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
      if (process.env.NODE_ENV === 'development') {
      // all emails caught by nodemailer in-house ethereal.email service
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
      const transporter = nodemailer.createTransport(mailConfig)
      const message = {
        from: process.env.USER,
        to: user.email,
        subject: 'UP Stars Password Changed',
        html: `<p>What's up ${user.name}!</p><p>You've asked us to update your password and we want to let you know that it has been
          updated. You can use your new password to log in now!</p><p>If you didn't ask us to change it, please let us know.</p><p>Thanks,<br />The UP Stars Team</p>`
      }
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(error)
        }
      })
    }
  } catch (err) {
    console.error(err)
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
    const { roles, _id } = req.decoded
    const { name } = req.params
    // Retrieve users in the system based on roles and permissions
    if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || roles.indexOf('Mentor') !== -1) {
      const users = await User.find({
        'status': 'Active',
        'name': new RegExp(name, 'i')
      }).select('name').sort('name')

      return res.status(200).json({
        users
      })
      // For non-admin or mentor, this API only returns themselves in the search to prevent data leak.
    } else {
      const users = await User.find({
        '_id': _id,
        'status': 'Active'
      }).select('name').sort('name')

      res.status(200).json({
        users
      })
    }
  } catch (err) {
    console.error(err)
    next(err)
  }
}
