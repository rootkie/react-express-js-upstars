const User = require('../models/user')
const Student = require('../models/student')
const Class = require('../models/class')
let util = require('../util.js')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

// This email function really WORKS. PLEASE DONT RANDOMLY SEND MESSAGES TO GMAIL ACCOUNTS UNDER MY ADDRESS
// IM USING MY PERSONAL ADDRESS FOR TESTING. PLEASE REPLACE IT WITH THE REAL ONE ASAP!
module.exports.adminChangePassword = async (req, res, next) => {
// Every function here is restricted to SA only
  try {
    let {
      userId
    } = req.body

    // Find user and replace it with the newPassword before saving
    const user = await User.findById(userId)
      .nor([{
        'status': 'PermaDeleted'
      }, {
        'status': 'Deleted'
      }])
    if (!user) {
      throw ({
        status: 404,
        error: 'There is an error processing this as the user does not exist'
      })
    }
    let userName = user.profile.name
    let email = user.email
    let newPassword = crypto.randomBytes(20).toString('hex')
    user.password = newPassword
    const pwChanged = await user.save()
    if (pwChanged.password) {
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: 'yingkeatwon@gmail.com',
          clientId: '925154463776-1se2s2h200ur2jsnrv5btkrl72970339.apps.googleusercontent.com',
          clientSecret: 'CLDCZqXyLXlXnl-KAbvyPRuA',
          refreshToken: '1/O2eZ6i9-Ih6gH5U4vK9ojcMJCV5eVWJbx9GomDitHQEkqQNxyfFBE5eHBukpCdwa'
        }
      })

      transporter.on('token', token => {
        console.log('A new access token was generated')
        console.log('User: %s', token.user)
        console.log('Access Token: %s', token.accessToken)
        console.log('Expires: %s', new Date(token.expires))
      })

      let message = {
        from: 'yingkeatwon@gmail.com',
        to: email,
        subject: 'Password Request for UPStars',
        html: `<p>Hello ${userName},</p><p>A user has requested a password retrieval for this email at ${email}.<b>If you have no idea what this message is about, please ignore it.</b></p>
        <p>New Password: ${newPassword}</p><p>You may now log into UPStars with this new password!</p><p>Thanks,<br />UPStars</p>`
      }
      transporter.sendMail(message, function (error, info) {
        if (error) {
          return console.log(error)
        }
        console.log('Message sent: ' + info.response)
      })
    }
    res.status(200).json({
      user: pwChanged
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

module.exports.changeUserStatusAndPermissions = async (req, res, next) => {
  try {
    let {
      userId,
      newStatus,
      newRoles
    } = req.body
    let edited = {}
    let editedClass = null
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

    // Returns token and necessary information
    return res.status(200).json({
      user: util.generateToken(updatedUser),
      _id: updatedUser._id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      status: updatedUser.status,
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

module.exports.createUser = async (req, res, next) => {
  try {
    let {
      email,
      password,
      profile,
      commencementDate,
      exitDate,
      roles
    } = req.body
    // Check that both email and password are provided
    if (!email) {
      throw ({
        status: 400,
        error: 'Please provide an email'
      })
    }
    if (!password) {
      throw ({
        status: 400,
        error: 'Please provide a password'
      })
    }
    // Check if the email has already been used
    const existingUser = await User.findOne({
      email
    })

    if (existingUser) {
      throw ({
        status: 409,
        error: 'Email already exist.'
      })
    }
    // Create new User and save it after validating it.
    const user = new User({
      email,
      password,
      profile,
      commencementDate: util.formatDate(commencementDate),
      exitDate: util.formatDate(exitDate),
      roles,
      status: 'Accepted'
    })
    const error = await user.validateSync()
    if (error) {
      throw ({
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      })
    }
    const userObject = await user.save()

    let newUser = {
      _id: userObject._id,
      name: userObject.profile.name,
      roles: userObject.roles
    }

    res.status(201).json({
      newUser
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

module.exports.getPendingUsers = async (req, res, next) => {
  try {
    // Find all users with status as Pending
    const users = await User.find({
      'status': 'Pending'
    }).select('profile.name roles email').sort('profile.name')
    res.json({
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
    }).select('profile.name roles email').sort('profile.name')
    const students = await Student.find({
      'status': 'Suspended'
    }).select('profile.name').sort('profile.name')
    res.json({
      users,
      students
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
    }).select('profile.name roles email').sort('profile.name')
    // Find students who are deleted
    const students = await Student.find({
      'status': 'Deleted'
    }).select('profile.name').sort('profile.name')
    res.json({
      users,
      students
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
    if (!userId) {
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
