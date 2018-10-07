const util = require('../util.js')
const { generateRefresh } = util
const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = request('http://localhost:3000/api')
require('dotenv').config()

describe('login testing', () => {
  test('login with no credentials', async () => {
    expect.assertions(2)
    const response = await app.post('/login')
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and password.'})
  })

  test('login with missing password', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: ''})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and password.'})
  })

  test('login with missing email', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({password: ''})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and password.'})
  })

  test('login with wrong email', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: 'test@upstars.com', password: 'password'})
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({'error': 'Wrong email or password'})
  })

  test('login with wrong password', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: 'testuser@upstars.com', password: 'password123'})
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({'error': 'Wrong email or password'})
  })

  test('login with wrong password and email', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: 'test@upstars.com', password: 'password123'})
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({'error': 'Wrong email or password'})
  })

  test('login with suspended account', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: 'testuser2@upstars.com', password: 'password'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Your account has been suspended, please contact the administrator for follow up actions'})
  })

  test('login with unverified account', async () => {
    expect.assertions(2)
    const response = await app.post('/login').send({email: 'testuser5@upstars.com', password: 'password'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Your account has yet to be verified, please verify your email by checking your email account'})
  })

  test('login normally', async () => {
    expect.assertions(3)
    const response = await app.post('/login').send({email: 'testuser@upstars.com', password: 'password'})
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body).toHaveProperty('refresh')
  })
})

describe('x-access-token functionalities', () => {
  let accessToken, expiringAccessToken
  beforeAll(async () => {
    const response = await app.post('/login').send({email: 'testuser@upstars.com', password: 'password'})
    accessToken = response.body.token
    const user = {
      _id: '5b912ba72b9ec042a58f88a4',
      classes: ['5b97b8f2adfb2e018c64d372'],
      status: 'Active',
      roles: ['Tutor', 'SuperAdmin', 'Admin'],
      name: 'Wuying  Kong'
    }
    expiringAccessToken = await jwt.sign(user, process.env.SECRET, {
      expiresIn: '9m'
    })
  })
  test('empty check returns false', async () => {
    expect.assertions(2)
    const response = await app.get('/check')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'auth': false, 'name': null, '_id': null, 'classes': null, 'roles': null})
  })

  test('fake check returns false', async () => {
    expect.assertions(2)
    const response = await app.get('/check').set('x-access-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTExMTE1NzRmNTIwNTM5MzA4MjBhNDIiLCJyb2xlcyI6WyJUdXRvciJdLCJzdGF0dXMiOiJBY2NlcHRlZCIsImNsYXNzZXMiOltdLCJpYXQiOjE1MTEwNjkzMDUsImV4cCI6MTUxMTQyOTMwNX0.3LknzZoOzg6SozNQVhnEuuEY3ZPmjMHc7ZWDvUmp0vA')
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'auth': false, 'name': null, '_id': null, 'classes': null, 'roles': null})
  })

  test('real token check returns true', async () => {
    expect.assertions(2)
    const response = await app.get('/check').set('x-access-token', accessToken)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'auth': true, 'name': 'Wuying  Kong', '_id': '5b912ba72b9ec042a58f88a4', 'classes': ['5b97b8f2adfb2e018c64d372'], 'roles': ['Tutor', 'SuperAdmin', 'Admin']})
  })

  test('expiring token check returns expiring', async () => {
    expect.assertions(2)
    const response = await app.get('/check').set('x-access-token', expiringAccessToken)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'auth': 'expiring', 'name': 'Wuying  Kong', '_id': '5b912ba72b9ec042a58f88a4', 'classes': ['5b97b8f2adfb2e018c64d372'], 'roles': ['Tutor', 'SuperAdmin', 'Admin']})
  })
})

describe('refresh tokens test', () => {
  let refreshToken, deletedUserRefresh
  beforeAll(async () => {
    const response = await app.post('/login').send({email: 'testuser@upstars.com', password: 'password'})
    refreshToken = response.body.refresh
    // Fake User ID
    const _id = '5b912ba72b9ec042a58f8855'
    deletedUserRefresh = await generateRefresh(_id)
  })

  test('refresh token returns new valid x-access-token', async () => {
    expect.assertions(3)
    const response = await app.post('/refresh').send({refreshToken})
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.status).toBe(true)
  })

  test('invalid refresh tokens returns false', async () => {
    expect.assertions(3)
    const response = await app.post('/refresh').send({refreshToken: refreshToken + 'abc'})
    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeNull()
    expect(response.body.status).toBe(false)
  })

  test('refresh tokens for invalid users returns false', async () => {
    expect.assertions(3)
    const response = await app.post('/refresh').send({refreshToken: deletedUserRefresh})
    expect(response.statusCode).toBe(200)
    expect(response.body.token).toBeNull()
    expect(response.body.status).toBe(false)
  })
})

describe('testing user registration', () => {
  // Make sure that NODE_ENV in .env file is set to development
  // This allows the test to bypass the captcha validation
  const userData =
  {
    // Best to replace the email with your own personal email to test the response.
    email: 'testuser10@upstars.com',
    profile: {
      name: 'Test User',
      gender: 'M',
      dob: '2004-03-09T16:00:00.000Z',
      nationality: 'singaporean',
      nric: 'T0423783D',
      address: 'Upstars Block 999 #13-902',
      postalCode: 654999,
      homephone: 63846358,
      handphone: 94562395,
      schoolClass: 'Sec 2-5',
      schoolLevel: 'Upstars Secondary'
    },
    password: 'password',
    commencementDate: '2018-09-25T12:53:52+00:00',
    exitDate: '2018-10-25T12:53:52+00:00',
    preferredTimeSlot: ['Tuesday 7-9.30pm']
  }

  test('empty captcha, registration not working', async () => {
    expect.assertions(2)
    const response = await app.post('/register').send({
      userData,
      captchaCode: ''
    })
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({'error': 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'})
  })

  test('wrong captcha, registration not working', async () => {
    expect.assertions(2)
    const response = await app.post('/register').send({
      ...userData,
      captchaCode: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    })
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({'error': 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'})
  })

  describe('bypass captcha in these tests', () => {
    // Missing email and password
    const missingUserInfo = {
      profile: {
        name: 'Test User',
        gender: 'M',
        dob: '2004-03-09T16:00:00.000Z',
        nationality: 'singaporean',
        nric: 'T0423783D',
        address: 'Upstars Block 999 #13-902',
        postalCode: 654999,
        homephone: 63846358,
        handphone: 94562395,
        schoolClass: 'Sec 2-5',
        schoolLevel: 'Upstars Secondary'
      },
      commencementDate: '2018-09-25T12:53:52+00:00',
      exitDate: '2018-10-25T12:53:52+00:00',
      preferredTimeSlot: ['Tuesday 7-9.30pm']
    }

    test('registration working', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send(userData)
      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({'success': 'true'})
    })

    test('duplicate email', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser@upstars.com',
        password: 'password'
      })
      expect(response.statusCode).toBe(409)
      expect(response.body).toEqual({'error': 'Email already exists.'})
    })

    test('missing email', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        password: 'password'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide an email and password that is also at least 6 characters long.'})
    })

    test('missing password', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser10@upstars.com'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide an email and password that is also at least 6 characters long.'})
    })

    test('Bad Password', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser10@upstars.com',
        password: 'pass'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide an email and password that is also at least 6 characters long.'})
    })

    test('Suspended User attempting to register', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser2@upstars.com',
        password: 'password'
      })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({'error': 'Your account has been suspended. Please contact the administrator for follow up actions'})
    })

    // The test(s) to check if the new account is really created and old account randomised is to be done in
    // UserController.test.js under searching for user via ID
    test('Recreating new account for deleted users', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser6@upstars.com',
        password: 'password'
      })
      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({'success': 'true'})
    }, 10000)
  })
})

describe('verify email address exist using links', () => {
  let encodedString
  test('no email token', async () => {
    expect.assertions(2)
    const response = await app.post('/verifyEmail')
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Something went wrong, please try again.'})
  })

  test('empty email token', async () => {
    expect.assertions(2)
    const response = await app.post('/verifyEmail').send({token: ''})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Something went wrong, please try again.'})
  })

  test('broken email token', async () => {
    expect.assertions(2)
    const response = await app.post('/verifyEmail').send({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmFjY2VhNTI1Y2IyYjY4Mjg2ODI3NGQiLCJpYXQiOjE1MzgwNTE3NDl9.nuHfY0bF13LT3qajl91fCycyyh5ZkbrHSvF06iLshqg'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Something went wrong, please try again.'})
  })

  beforeAll(async () => {
    // testuser5@upstars.com used
    const objectToEncode = {
      _id: '5ba8c8cb8e235732b485a60e'
    }
    encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL)
  })

  test('verify email using a valid token', async () => {
    expect.assertions(2)
    const response = await app.post('/verifyEmail').send({token: encodedString})
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'status': 'success'})
  })
})

describe('Password Changes by the User', () => {
  test('no POST req body prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword')
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and your NRIC number.'})
  })

  test('no email prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({nric: 'S925556F'})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and your NRIC number.'})
  })

  test('no nric prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({email: 'testuser3@upstars.com'})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide an email address and your NRIC number.'})
  })

  test('wrong nric prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({email: 'testuser3@upstars.com', nric: 'S9255562F'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Wrong email or nric. Please try again'})
  })

  test('wrong email prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({email: 'testuser4@upstars.com', nric: 'S925556F'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Wrong email or nric. Please try again'})
  })

  test('suspended user prompts errors', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({email: 'testuser2@upstars.com', nric: 'S924456F'})
    expect(response.statusCode).toBe(403)
    expect(response.body).toEqual({'error': 'Your account has been suspended, please contact the administrator for follow up actions'})
  })

  test('proper requests returns success', async () => {
    expect.assertions(2)
    const response = await app.post('/changepassword').send({email: 'testuser3@upstars.com', nric: 'S925556F'})
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'success': true})
  })
})

describe('reset password tests', () => {
  let token
  beforeAll(async () => {
    const objectToEncode = {
      email: 'testuser3@upstars.com',
      _id: '5b9255700333773af993ae9c',
      random: process.env.RESET_PASSWORD_RANDOM
    }
    await app.post('/changepassword').send({email: 'testuser3@upstars.com', nric: 'S925556F'})
    token = jwt.sign(objectToEncode, process.env.SECRET_EMAIL, {
      expiresIn: 60 * 30
    })
  })

  test('no fields throws error', async () => {
    expect.assertions(2)
    const response = await app.post('/resetpassword')
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'There\'s something wrong, please try again.'})
  })

  test('no password throws error', async () => {
    expect.assertions(2)
    const response = await app.post('/resetpassword').send({token: 'test-token'})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'There\'s something wrong, please try again.'})
  })

  test('no token throws error', async () => {
    expect.assertions(2)
    const response = await app.post('/resetpassword').send({password: 'password'})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'There\'s something wrong, please try again.'})
  })

  test('bad password throws error', async () => {
    expect.assertions(2)
    const response = await app.post('/resetpassword').send({password: 'pass', token: 'test-token'})
    expect(response.statusCode).toBe(400)
    expect(response.body).toEqual({'error': 'Please provide a password that is at least 6 characters long.'})
  })

  test.only('proper reset password returns success', async () => {
    expect.assertions(2)
    const response = await app.post('/resetpassword').send({password: 'password123', token})
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({'status': 'success'})
  },100000)
})
