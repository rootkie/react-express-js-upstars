const User = require('../models/user')
const util = require('../util.js')
const { generateToken, generateRefresh } = util
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
        status: 401,
        error: 'Wrong email or password'
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
      'profile.nric': nric,
      status: {
        $ne: 'Deleted'
      }
    })

    // Checks if user exists
    if (!user) {
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
    // Random 15 bit char saved in DB and part of token of auth
    let userName = user.profile.name
    let random = crypto.randomBytes(15).toString('hex')
    if (process.env.NODE_ENV === 'development') {
      random = process.env.RESET_PASSWORD_RANDOM
    }
    user.resetPasswordToken = random

    let objectToEncode = {
      email,
      _id: user._id,
      random
    }
    let encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL, {
      expiresIn: 60 * 30
    })
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
    let link = `${process.env.DOMAIN_NAME}/resetpassword/${encodedString}`
    let message = {
      from: process.env.USER,
      to: email,
      subject: 'Password Request for UPStars',
      html: `<p>Hello ${userName},</p><p>A user has requested a password retrieval for this email at ${email}.<b> If you have no idea what this message is about, please ignore it.</b></p>
       <p>Reset your password by clicking at this link: ${link}</p><p>Please note that for security purposes, the link will expire in 30 minutes.</p><p>Thanks,<br />The UPStars Team</p>`
    }
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error)
        throw({
          status: 500,
          error: 'There is something wrong with our mail servers, please contact the administrators for support.'
        })
      }
      user.save()
      res.status(200).send()
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
    } else if (password.length < 6) {
      throw ({
        status: 400,
        error: 'Please provide a password that is at least 6 characters long.'
      })
    }

    jwt.verify(token, process.env.SECRET_EMAIL, async (err, decoded) => {
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
          resetPasswordToken: random,
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
          return res.status(200).send()
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
  // Special addition for development, may remove during deployment / production
  let secret = process.env.CAPTCHA_SECRET
  if (process.env.NODE_ENV === 'development' && typeof (captchaCode) === 'undefined') secret = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
  axios.post('https://www.google.com/recaptcha/api/siteverify',
    querystring.stringify({
      secret,
      response: captchaCode
    }))
    .then(async response => {
      try {
        if (response.data.success === false) {
          throw ({
            status: 401,
            error: 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'
          })
        }
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
        let encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL)
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
        let link = `${process.env.DOMAIN_NAME}/verifyaccount/${encodedString}`
        let message = {
          from: process.env.USER,
          to: email,
          subject: 'Thanks for joining UPStars!',
          html: `<p>Welcome, ${userObject.profile.name}!</p><p>Thanks for joining UPStars as a volunteer. We would love to have you on board.</p><p>We would like you to verify your account by clicking on the following link:</p>
           <p>${link}</p><p>Please note that for security purposes, please confirm your email within 3 days.</p><p>For reference, here's your log-in information:</p><p>Login email: ${userObject.email}</p>
           <p>If you have any queries, feel free to email the Mrs Hauw SH (volunteer.upstars@gmail.com)</p><p>Thanks,<br />The UPStars Team</p>`
        }
        transporter.sendMail(message, async (error, info) => {
          if (error) {
            console.log(error)
            await User.deleteOne({ _id: userObject._id })
            throw({
              status: 500,
              error: 'There is something wrong with our mail servers, please contact the administrators for support.'
            })
          } else {
            console.log('Message sent')
            res.status(201).send()
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
    })
}

module.exports.verifyEmail = async (req, res, next) => {
  let {token} = req.body
  jwt.verify(token, process.env.SECRET_EMAIL, async (err, decoded) => {
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
        return res.status(200).send()
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
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
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
    jwt.verify(refreshToken, process.env.SECRET_REFRESH, async (err, decoded) => {
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
