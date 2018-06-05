const User = require('../models/user')
const util = require('../util.js')
const { generateToken, generateRefresh } = util
const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const nodemailer = require('nodemailer')
const querystring = require('querystring')
const crypto = require('crypto')
// ============== Start of all the functions ==============
// Everyone can access without token

module.exports.login = async (req, res, next) => {
  try {
    let {
      password,
      email
    } = req.body
    if (!email || !password) {
      throw ({
        status: 400,
        error: 'Please provide an email address and password.'
      })
    }

    // Search for any users whose accounts are not yet deleted
    const user = await User.findOne({
      email,
      status: {
        $ne: 'Deleted'
      }
    })

    // Checks if user exists
    if (!user) {
      throw ({
        status: 404,
        error: 'Wrong email. Please sign up for an account here'
      })
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      throw ({
        status: 401,
        error: 'Wrong email or password'
      })
    }
    if (user.status === 'Suspended') {
      throw ({
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      })
    }

    if (user.status === 'Unverified') {
      throw ({
        status: 403,
        error: 'Your account has yet to be verified, please verify your email by checking your email account'
      })
    }

    res.json({
      token: generateToken(user),
      refresh: generateRefresh(user._id)
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

module.exports.changePassword = async (req, res, next) => {
  try {
    let {
      email,
      nric
    } = req.body
    if (!email || !nric) {
      throw ({
        status: 400,
        error: 'Please provide an email address and your NRIC number.'
      })
    }

    // Search for any users whose accounts are not yet deleted
    const user = await User.findOne({
      email,
      status: {
        $ne: 'Deleted'
      }
    })

    // Checks if user exists
    if (!user || user.profile.nric !== nric) {
      throw ({
        status: 403,
        error: 'Wrong email or nric. Please try again'
      })
    }
    if (user.status === 'Suspended') {
      throw ({
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      })
    }
    // Fix plaintext security flaw: using encoded jwt to send as link for password change.
    // Currently using the same password to sign jwt. Expires in 30 minutes
    let userName = user.profile.name
    let random = crypto.randomBytes(15).toString('hex')
    user.resetPasswordToken = random
    user.save()

    let objectToEncode = {
      email,
      _id: user._id,
      random
    }
    let encodedString = jwt.sign(objectToEncode, config.secret, {
      expiresIn: 60 * 30
    })
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: config.user,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken
      }
    })
    let link = `http://localhost:3000/resetpassword/${encodedString}`
    let message = {
      from: config.user,
      to: email,
      subject: 'Password Request for UPStars',
      html: `<p>Hello ${userName},</p><p>A user has requested a password retrieval for this email at ${email}.<b> If you have no idea what this message is about, please ignore it.</b></p>
       <p>Reset your password by clicking at this link: ${link}</p><p>Please note that for security purposes, the link will expire in 30 minutes.</p><p>Thanks,<br />The UPStars Team</p>`
    }
    transporter.sendMail(message, function (error, info) {
      if (error) {
        console.log(error)
        throw ({
          status: 400,
          error: 'An error has occurred. That is all we know.'
        })
      }
      console.log('Message sent: ' + info.response)
      res.status(200).json({
        success: true
      })
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

module.exports.resetPassword = async (req, res, next) => {
  try {
    let {
      password,
      token
    } = req.body
    if (!password || !token) {
      throw ({
        status: 400,
        error: 'There\'s something wrong, please try again.'
      })
    }

    jwt.verify(token, config.secret, async (err, decoded) => {
      try {
        if (err) {
          throw ({
            status: 403,
            error: 'Something went wrong, please try again.'
          })
        }
        let { email, _id, random } = decoded
        const user = await User.findOne({
          email,
          _id,
          status: {
            $ne: 'Deleted'
          }
        })
        // Checks if user exists
        if (!user || user.resetPasswordToken !== random) {
          throw ({
            status: 403,
            error: 'Something went wrong, please try again.'
          })
        }
        if (user.status === 'Suspended') {
          throw ({
            status: 403,
            error: 'Your account has been suspended, please contact the administrator for follow up actions'
          })
        }
        user.password = password
        user.resetPasswordToken = ''
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

module.exports.register = async (req, res, next) => {
  let {
    email,
    password,
    profile,
    commencementDate,
    exitDate,
    preferredTimeSlot,
    captchaCode
  } = req.body

  axios.post('https://www.google.com/recaptcha/api/siteverify',
    querystring.stringify({
      secret: '6LdCS1IUAAAAAKByA_qbWeQGuKCgBXNmD_k2XWSK',
      response: captchaCode
    }))
    .then(async response => {
      console.log(response.data)
      if (response.data.success === false) {
        throw ({
          status: 401,
          error: 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'
        })
      }
      try {
        // Return error if no password or email provided
        if (!email || !password || password.length < 6) {
          throw ({
            status: 400,
            error: 'Please provide an email and password that is also at least 6 characters long.'
          })
        }

        // Find the user based on email
        const existingUser = await User.findOne({
          email
        })
        // 3 cases:
        // case 1: Email exists and user is legitimate
        if (existingUser && existingUser.status !== 'Deleted' && existingUser.status !== 'Suspended') {
          throw {
            status: 409,
            error: 'Email already exists.'
          }
        }
        // case 2: user has a bad record and is suspended
        if (existingUser && existingUser.status === 'Suspended') {
          throw {
            status: 403,
            error: 'Your account has been suspended. Please contact the administrator for follow up actions'
          }
        }
        // case 3: user is deleted by admin or by oneself
        // If user choose to create a new account after deleting, the old records preserved will be changed while the ID remains and
        // a new account would be made. Else the user always have the ability to ask the admin to restore their account.
        // This case, the passwords and emails are changed to follow a unique string. It is not restorable but nonetheless traceable in past attendance records.
        // Using the native crypto package, we generate true random strings to add to email and password so they are really gone.
        if (existingUser && existingUser.status === 'Deleted') {
          existingUser.email = crypto.randomBytes(4).toString('hex') + 'deleted' + existingUser._id + '@upstars.com'
          existingUser.password = existingUser._id + crypto.randomBytes(5).toString('hex')
          existingUser.status = 'PermaDeleted'
          await existingUser.save()
        }
        // Case 4: User have not confirmed email
        if (existingUser && existingUser.status === 'Unverified') {
          throw {
            status: 401,
            error: 'Your account has yet to be verified. Please confirm your email address by checking your email inbox'
          }
        }

        // Create a new user after validating and making sure everything is right
        const user = new User({
          email,
          password,
          profile,
          commencementDate,
          exitDate,
          preferredTimeSlot,
          misc: {
            competence: [{
              languages: [''],
              subjects: [''],
              interests: ['']
            }]
          },
          roles: ['Tutor']
        })
        const error = await user.validateSync()
        if (error) {
          console.log(error)
          throw {
            status: 400,
            error: 'There is something wrong with the client input. That is all we know.'
          }
        }
        const userObject = await user.save()

        // Send verification email: (3 days expiry just to be sure)
        let objectToEncode = {
          _id: userObject._id
        }
        let encodedString = jwt.sign(objectToEncode, config.secret)
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: config.user,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken
          }
        })
        let link = `http://localhost:3000/verifyaccount/${encodedString}`
        let message = {
          from: config.user,
          to: email,
          subject: 'Thanks for joining UPStars!',
          html: `<p>Welcome, ${userObject.profile.name}!</p><p>Thanks for joining UPStars as a volunteer. We would love to have you on board.</p><p>We would like you to verify your account by clicking on the following link:</p>
           <p>${link}</p><p>Please note that for security purposes, please confirm your email within 3 days.</p><p>For reference, here's your log-in information:</p><p>Login email: ${userObject.email}</p>
           <p>If you have any queries, feel free to email the Mrs Hauw SH (volunteer.upstars@gmail.com)</p><p>Thanks,<br />The UPStars Team</p>`
        }
        transporter.sendMail(message, function (error, info) {
          if (error) {
            console.log(error)
            throw ({
              status: 400,
              error: 'An error has occurred. That is all we know.'
            })
          }
          console.log('Message sent: ' + info.response)
          res.status(200).json({
            success: true
          })
        })
        res.status(201).json({
          token: generateToken(userObject),
          refresh: generateRefresh(userObject._id)
        })
      } catch (err) {
        console.log(err)
        if (err.status) {
          res.status(err.status).send({
            error: err.error
          })
        } else next(err)
      }
    })
}

module.exports.verifyEmail = async (req, res, next) => {
  let {token} = req.body
  jwt.verify(token, config.secret, async (err, decoded) => {
    try {
      if (err) {
        throw ({
          status: 403,
          error: 'Something went wrong, please try again.'
        })
      }
      let { _id } = decoded
      const user = await User.findOne({
        _id,
        status: {
          $ne: 'Deleted'
        }
      })
      // Checks if user exists
      if (!user) {
        throw ({
          status: 403,
          error: 'Something went wrong, please try again.'
        })
      }
      user.status = 'Pending'
      const newuser = await user.save()
      if (newuser) {
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
  })
}

module.exports.check = async (req, res, next) => {
  try {
    let token = req.headers['x-access-token']
    let result = (auth, name, _id, classes, roles) => {
      return res.status(200).json({
        auth,
        name,
        _id,
        classes,
        roles
      })
    }
    if (!token) return result(false, null, null, null, null)

    // Start token verification for expiry and integrity
    jwt.verify(token, config.secret, (err, decoded) => {
      // Default error handling for expired jwt token: notify front end to call for refresh api
      // Similarly, expiring tokens will also be send in for a refresh to enjoy uninterrupted usage
      if (err) {
        return result(false, null, null, null, null)
      } else {
        // Expiring tokens will be refreshed before hand: (in minutes)
        let timeLeft = Math.floor(decoded.exp - (Date.now() / 1000)) / 60
        if (timeLeft <= 10) {
          return result('expiring', decoded.name, decoded._id, decoded.classes, decoded.roles)
        }
        return result(true, decoded.name, decoded._id, decoded.classes, decoded.roles)
      }
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

module.exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    let result = (status, token) => {
      return res.status(200).json({
        status,
        token
      })
    }
    // The response comes with both status (true or false) and the token (null if status is false)
    if (!refreshToken) return result(false, null)
    jwt.verify(refreshToken, config.secret, async (err, decoded) => {
      if (err) {
        return result(false, null)
      } else {
        let { _id } = decoded
        const user = await User.findOne({
          _id,
          status: {
            $ne: 'Deleted'
          }
        })
        if (!user || user.status !== 'Active') {
          return result(false, null)
        }
        return result(true, generateToken(user))
      }
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
