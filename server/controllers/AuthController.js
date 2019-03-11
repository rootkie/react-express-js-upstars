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
      const error = {
        status: 400,
        error: 'Please provide an email address and password.'
      }
      throw error
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
      const error = {
        status: 401,
        error: 'Wrong email or password'
      }
      throw error
    }
    // compare password
    const isMatch = await user.comparePasswordPromise(password)
    if (!isMatch) {
      const error = {
        status: 401,
        error: 'Wrong email or password'
      }
      throw error
    }
    if (user.status === 'Suspended') {
      const error = {
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      }
      throw error
    }

    if (user.status === 'Unverified') {
      const error = {
        status: 403,
        error: 'Your account has yet to be verified, please verify your email by checking your email account'
      }
      throw error
    }

    res.json({
      token: generateToken(user),
      refresh: generateRefresh(user._id)
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

module.exports.changePassword = async (req, res, next) => {
  try {
    let {
      email,
      nric
    } = req.body
    if (!email || !nric) {
      const error = {
        status: 400,
        error: 'Please provide an email address and your NRIC number.'
      }
      throw error
    }

    // Search for any users whose accounts are not yet deleted
    const user = await User.findOne({
      email,
      nric,
      status: {
        $ne: 'Deleted'
      }
    })

    // Checks if user exists
    if (!user) {
      const error = {
        status: 403,
        error: 'Wrong email or nric. Please try again'
      }
      throw error
    }
    if (user.status === 'Suspended') {
      const error = {
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      }
      throw error
    }
    // Fix plaintext security flaw: using encoded jwt to send as link for password change.
    // Random 15 bit char saved in DB and part of token of auth
    const userName = user.name
    let random = crypto.randomBytes(15).toString('hex')
    // This part is for aiding tests to create the same tokens so they can pass successfully.
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

    user.save()
    res.status(200).send()

    // The email is sent after the user data is successfully saved and a 200 reply is returned
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
    const transporter = nodemailer.createTransport(mailConfig)
    const link = `${process.env.DOMAIN_NAME}/resetpassword/${encodedString}`
    const message = {
      from: process.env.USER,
      to: email,
      subject: 'Password Request for UP Stars',
      html: `<p>Hello ${userName},</p><p>A user has requested a password retrieval for this email at ${email}.<b> If you have no idea what this message is about, please ignore it.</b></p>
       <p>Reset your password by clicking this link: ${link}</p><p>Please note that for security purposes, the link will expire in 30 minutes.</p><p>Thanks,<br />The UP Stars Team</p>`
    }
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error)
      }
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

module.exports.resetPassword = async (req, res, next) => {
  try {
    let {
      password,
      token
    } = req.body
    if (!password || !token) {
      const error = {
        status: 400,
        error: 'There\'s something wrong, please try again.'
      }
      throw error
    } else if (password.length < 6) {
      const error = {
        status: 400,
        error: 'Please provide a password that is at least 6 characters long.'
      }
      throw error
    }
    const decoded = await jwt.verify(token, process.env.SECRET_EMAIL)
    const { email, _id, random } = decoded
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
      const error = {
        status: 403,
        error: 'Something went wrong, please try again.'
      }
      throw error
    }
    if (user.status === 'Suspended') {
      const error = {
        status: 403,
        error: 'Your account has been suspended, please contact the administrator for follow up actions'
      }
      throw error
    }
    // The code below runs if user does not fail in any of the scenerio above.
    user.password = password
    user.resetPasswordToken = ''
    const pwChanged = await user.save()
    if (pwChanged) {
      return res.status(200).send()
    }
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      res.status(403).send({
        error: 'An error occurred concerning your tokens, please try again.'
      })
    } else next(err)
  }
}

module.exports.register = async (req, res, next) => {
  const {
    email, password, name, dob, gender, nationality, nric, address, postalCode, handphone, homephone, schoolLevel, schoolClass, commencementDate, exitDate, preferredTimeSlot, captchaCode
  } = req.body

  try {
  // Return error if no password or email provided
    if (!email || !password || password.length < 6) {
      const error = {
        status: 400,
        error: 'Please provide an email and password that is also at least 6 characters long.'
      }
      throw error
    }

    // Find the user based on email
    const existingUser = await User.findOne({
      email
    })
    // 3 cases:
    // case 1: Email exists and user is legitimate
    if (existingUser && existingUser.status !== 'Deleted' && existingUser.status !== 'Suspended') {
      const error = {
        status: 409,
        error: 'Email already exists.'
      }
      throw error
    }
    // case 2: user is suspended
    if (existingUser && existingUser.status === 'Suspended') {
      const error = {
        status: 403,
        error: 'Your account has been suspended. Please contact the administrator for follow up actions'
      }
      throw error
    }

    // Create a new user after validating and making sure everything is right
    const user = new User({
      email,
      password,
      name,
      dob,
      gender,
      nationality,
      nric,
      address,
      postalCode,
      handphone,
      homephone,
      schoolLevel,
      schoolClass,
      fatherName: '',
      fatherOccupation: '',
      fatherEmail: '',
      motherName: '',
      motherOccupation: '',
      motherEmail: '',
      hobbies: '',
      careerGoal: '',
      languages: '',
      subjects: '',
      interests: '',
      purposeObjectives: '',
      developmentGoals: '',
      commencementDate,
      exitDate,
      preferredTimeSlot,
      roles: ['Tutor']
    })

    // Special addition for development, may remove during deployment / production
    let secret = process.env.CAPTCHA_SECRET_PROD
    if (process.env.NODE_ENV === 'development') {
      secret = process.env.CAPTCHA_SECRET_DEV
    }
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify',
      querystring.stringify({
        secret,
        response: captchaCode
      }))

    if (response.data.success === false) {
      const error = {
        status: 401,
        error: 'There is something wrong with the client Captcha. That is all we know.'
      }
      throw error
    }

    // case 3: user is deleted by admin or by oneself
    // If user choose to create a new account after deleting, the old records preserved will be changed while the ID remains and
    // a new account would be made. This way, the user always have the ability to ask the admin to restore their deleted account.
    // Passwords and emails are changed to generate a unique string. It is not for restoration but traceability in past attendance records.
    // Using the native crypto package, it generates true random strings.
    if (existingUser && existingUser.status === 'Deleted') {
      existingUser.email = crypto.randomBytes(4).toString('hex') + 'deleted' + existingUser._id + '@upstars.com'
      existingUser.password = existingUser._id + crypto.randomBytes(5).toString('hex')
      existingUser.status = 'PermaDeleted'
      await existingUser.save()
    }

    const userError = await user.validateSync()
    if (userError) {
      console.error(userError)
      const error = {
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      }
      throw error
    }
    const userObject = await user.save()
    res.status(201).send()

    // Send verification email: (3 days expiry just to be sure)
    const objectToEncode = {
      _id: userObject._id
    }
    const encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL, { expiresIn: '3 days' })
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
    const transporter = nodemailer.createTransport(mailConfig)
    const link = `${process.env.DOMAIN_NAME}/verifyaccount/${encodedString}`
    const message = {
      from: process.env.USER,
      to: email,
      subject: 'Thanks for joining UP Stars!',
      html: `<p>Welcome, ${userObject.name}!</p><p>Thanks for joining UPStars as a volunteer. We would love to have you on board.</p><p>We would like you to verify your account by clicking on the following link:</p>
           <p>${link}</p><p>Please note that for security purposes, please confirm your email within 3 days.</p><p>For reference, here's your log-in information:</p><p>Login email: ${userObject.email}</p>
           <p>If you have any queries, feel free to email Mrs Hauw SH (volunteer.upstars@gmail.com)</p><p>Thanks,<br />The UP Stars Team</p>`
    }
    transporter.sendMail(message, async (error, info) => {
      if (error) {
        console.error(error)
      }
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

module.exports.verifyEmail = async (req, res, next) => {
  const {token} = req.body
  jwt.verify(token, process.env.SECRET_EMAIL, async (err, decoded) => {
    try {
      if (err) {
        const error = {
          status: 403,
          error: 'Something went wrong, please try again.'
        }
        throw error
      }
      const { _id } = decoded
      const user = await User.findOne({
        _id,
        status: {
          $ne: 'Deleted'
        }
      })
      // Checks if user exists
      if (!user) {
        const error = {
          status: 403,
          error: 'Something went wrong, please try again.'
        }
        throw error
      }
      user.status = 'Pending'
      const newuser = await user.save()
      if (newuser) {
        return res.status(200).send()
      }
    } catch (err) {
      console.error(err)
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
    const token = req.headers['x-access-token']
    const result = (auth, name, _id, classes, roles) => {
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
        // Expiring tokens will be refreshed before hand: (timeLeft is calculated in terms of minutes)
        const timeLeft = Math.floor(decoded.exp - (Date.now() / 1000)) / 60
        if (timeLeft <= 10) {
          return result('expiring', decoded.name, decoded._id, decoded.classes, decoded.roles)
        }
        return result(true, decoded.name, decoded._id, decoded.classes, decoded.roles)
      }
    })
  } catch (err) {
    console.error(err)
    next(err)
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
        const { _id } = decoded
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
    console.error(err)
    next(err)
  }
}

module.exports.newLink = async (req, res, next) => {
  try {
    const { email, nric } = req.body
    if (!email || !nric) {
      const error = {
        status: 400,
        error: 'Please provide an email address and nric'
      }
      throw error
    }
    const rawUser = await User.findOne({
      email,
      nric
    })
    if (!rawUser || rawUser.status !== 'Unverified') {
      // Not to reveal if the email address is actually registered
      return res.status(200).send()
    }
    // This is for the scenario which the user exists, then the email will be sent.
    res.status(200).send()
    const objectToEncode = {
      _id: rawUser._id
    }
    const encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL, { expiresIn: '3 days' })
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
    const link = `${process.env.DOMAIN_NAME}/verifyaccount/${encodedString}`
    const message = {
      from: process.env.USER,
      to: email,
      subject: 'Thanks for joining UP Stars - New Verification Link',
      html: `<p>Welcome, ${rawUser.name}!</p><p>Thanks for joining UP Stars as a volunteer. We would love to have you on board.</p>
            <p>You have requested for a new link to verify your account. If you did not made this request, please contact our administrator(s).</p>
            <p>We would like you to verify your account by clicking on the following link:</p>
           <p>${link}</p><p>Please note that for security purposes, please confirm your email within 3 days.</p><p>For reference, here's your log-in information:</p><p>Login email: ${rawUser.email}</p>
           <p>If you have any queries, feel free to email Mrs Hauw SH (volunteer.upstars@gmail.com)</p><p>Thanks,<br />The UP Stars Team</p>`
    }
    transporter.sendMail(message, async (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('Message sent')
      }
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
