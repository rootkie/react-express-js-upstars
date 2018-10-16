const request = require('supertest')
const app = request('http://localhost:3000/api')
const util = require('../util.js')
const { generateRefresh } = util
const jwt = require('jsonwebtoken')
require('dotenv').config()

// mongorestore --drop -d tests dump/tests
let userToken
beforeAll(async () => {
  const response = await app.post('/login').send({email: 'testuser@upstars.com', password: 'password'})
  userToken = response.body.token
})

describe('testing auth related API mostly without token', () => {
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
      expect.assertions(6)
      const response = await app.get('/check')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('auth', false)
      expect(response.body).toHaveProperty('name', null)
      expect(response.body).toHaveProperty('_id', null)
      expect(response.body).toHaveProperty('classes', null)
      expect(response.body).toHaveProperty('roles', null)
    })

    test('fake check returns false', async () => {
      expect.assertions(6)
      const response = await app.get('/check').set('x-access-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTExMTE1NzRmNTIwNTM5MzA4MjBhNDIiLCJyb2xlcyI6WyJUdXRvciJdLCJzdGF0dXMiOiJBY2NlcHRlZCIsImNsYXNzZXMiOltdLCJpYXQiOjE1MTEwNjkzMDUsImV4cCI6MTUxMTQyOTMwNX0.3LknzZoOzg6SozNQVhnEuuEY3ZPmjMHc7ZWDvUmp0vA')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('auth', false)
      expect(response.body).toHaveProperty('name', null)
      expect(response.body).toHaveProperty('_id', null)
      expect(response.body).toHaveProperty('classes', null)
      expect(response.body).toHaveProperty('roles', null)
    })

    test('real token check returns true', async () => {
      expect.assertions(6)
      const response = await app.get('/check').set('x-access-token', accessToken)
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('auth', true)
      expect(response.body).toHaveProperty('name', 'Wuying  Kong')
      expect(response.body).toHaveProperty('_id', '5b912ba72b9ec042a58f88a4')
      expect(response.body).toHaveProperty('classes', ['5b97b8f2adfb2e018c64d372'])
      expect(response.body).toHaveProperty('roles', ['Tutor', 'SuperAdmin', 'Admin'])
    })

    test('expiring token check returns expiring', async () => {
      expect.assertions(6)
      const response = await app.get('/check').set('x-access-token', expiringAccessToken)
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('auth', 'expiring')
      expect(response.body).toHaveProperty('name', 'Wuying  Kong')
      expect(response.body).toHaveProperty('_id', '5b912ba72b9ec042a58f88a4')
      expect(response.body).toHaveProperty('classes', ['5b97b8f2adfb2e018c64d372'])
      expect(response.body).toHaveProperty('roles', ['Tutor', 'SuperAdmin', 'Admin'])
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
      }, 8000)

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
    }, 10000)

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

    test('proper reset password returns success', async () => {
      expect.assertions(2)
      const response = await app.post('/resetpassword').send({password: 'password123', token})
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'status': 'success'})
    })
  })
})

// There is no need for a x-access-token in development,refer to routeMiddleware.js
// However, some APIs require it, so we will just parse it in
describe('testing admin related APIs', async () => {
  describe('retrieve pending users', () => {
    test('get pending users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/pendingUsers')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'users': [{'profile': {'name': 'Lai Ta Toh'}, 'status': 'Pending', 'roles': ['Tutor'], '_id': '5b96687dfcb4725189fe9efb'}, {'profile': {'name': 'Mr. Ho Jin He'}, 'status': 'Pending', 'roles': ['Tutor'], '_id': '5ba8c8cb8e235732b485a60e'}]})
    })
  })

  describe('retrieve suspended users', () => {
    test('get suspended users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/suspended')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'users': [{'profile': {'name': 'Marie G Kruger'}, 'status': 'Suspended', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b9255260333773af993ae9b'}]})
    })
  })

  describe('retrieve deleted users', () => {
    test('get deleted users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/deleted')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'users': [{'profile': {'name': 'Admin1'}, 'status': 'Deleted', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5a1111574f52053930820a42'}]})
    })
  })

  describe('responsive name search', () => {
    test('user - case insensitive', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/cRIs')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [{'profile': {'name': 'Mr. Cristian Bartell'}, 'status': 'Active', 'roles': ['Tutor'], '_id': '5b9255700333773af993ae9c'}])
      expect(response.body).toHaveProperty('suspendedMatched', [])
      expect(response.body).toHaveProperty('deletedMatched', [])
    })

    test('multiple match', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/G')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [{'profile': {'name': 'Wuying  Kong'}, 'status': 'Active', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b912ba72b9ec042a58f88a4'}])
      expect(response.body).toHaveProperty('suspendedMatched', [{'profile': {'name': 'Marie G Kruger'}, 'status': 'Suspended', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b9255260333773af993ae9b'}])
      expect(response.body).toHaveProperty('deletedMatched', [])
    })

    test('deleted match', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/admin')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [])
      expect(response.body).toHaveProperty('suspendedMatched', [])
      expect(response.body).toHaveProperty('deletedMatched', [{'profile': {'name': 'Admin1'}, 'status': 'Deleted', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5a1111574f52053930820a42'}])
    })
  })

  describe('mass deletion of users using ID', () => {
    test('no userId provided', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide a userId and ensure input is correct'})
    })

    test('deleting non-existing user', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user').send({userId: ['5ba8c8cb8e235732b485a620']})
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'The user you requested to delete does not exist.'})
    })

    test('deleting already deleted user', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user').send({userId: ['5a1111574f52053930820a42']})
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'The user you requested to delete does not exist.'})
    })

    test('deleting current users', async () => {
      expect.assertions(6)
      const response = await app.delete('/admin/user').send({userId: ['5b912ba72b9ec042a58f88a4']})
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'status': 'success'})
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user.status).toBe('Deleted')
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372').set('x-access-token', userToken)
      expect(classData.statusCode).toBe(200)
      expect(classData.body.class.users).toEqual([{'_id': '5b9255700333773af993ae9c', 'profile': {'name': 'Mr. Cristian Bartell'}}])
    })
  })

  describe('changing role and status of user', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'User does not exist'})
    })

    test('no userId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions').send({
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin']
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'User does not exist'})
    })

    test('wrong userId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions').send({
        'userId': '5ba8c8cb8e235732b485a620',
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin']
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'User does not exist'})
    })

    test('correct userId shows success and changes classes accordingly', async () => {
      expect.assertions(7)
      const response = await app.post('/admin/userStatusPermissions').send({
        'userId': '5b912ba72b9ec042a58f88a4',
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin', 'Admin']
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'success': true, 'editedClass': {'n': 1, 'nModified': 1, 'ok': 1}})
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user).toHaveProperty('status', 'Active')
      expect(userData.body.user).toHaveProperty('roles', ['SuperAdmin', 'Admin'])
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372').set('x-access-token', userToken)
      expect(classData.statusCode).toBe(200)
      expect(classData.body.class.users).toEqual([
        {
          'profile': {
            'name': 'Mr. Cristian Bartell'
          },
          '_id': '5b9255700333773af993ae9c'
        },
        {
          'profile': {
            'name': 'Wuying  Kong'
          },
          '_id': '5b912ba72b9ec042a58f88a4'
        }
      ])
    })

    test('works with either one of the 2 fields', async () => {
      expect.assertions(5)
      const response = await app.post('/admin/userStatusPermissions').send({
        'userId': '5b912ba72b9ec042a58f88a4',
        'newRoles': ['SuperAdmin', 'Admin', 'Tutor']
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'success': true, 'editedClass': {'n': 1, 'nModified': 1, 'ok': 1}})
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user).toHaveProperty('status', 'Active')
      expect(userData.body.user).toHaveProperty('roles', ['SuperAdmin', 'Admin', 'Tutor'])
    })
  })
})

describe.only('testing class related APIs', async () => {
  let lowPrivUserToken
  let classDetail = {
    className: 'Upstars Class B',
    classType: 'Tuition',
    dayAndTime: 'Friday 9PM',
    startDate: '2018-10-14T06:59:06.643Z'
  }
  // This user is in only 1 class and thus should not be able to view every single class available
  beforeAll(async () => {
    const response = await app.post('/login').send({email: 'testuser3@upstars.com', password: 'password123'})
    lowPrivUserToken = response.body.token
  })

  describe('add a new class', () => {
    test('adding without any fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide a className to search for'})
    })

    test('adding with className but missing remaining fields', async () => {
      expect.assertions(2)
      const response = await app.post('/class').send(classDetail)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'There is something wrong with the client input. That is all we know.'})
    })

    test('add duplicate class throws errors', async () => {
      expect.assertions(2)
      const response = await app.post('/class').send({className: 'Upstars Class A'})
      expect(response.statusCode).toBe(409)
      expect(response.body).toEqual({'error': 'Class already exist. Create a new class or edit a current class.'})
    })

    test('correct fields successfully add class', async () => {
      expect.assertions(11)
      const response = await app.post('/class').send({
        ...classDetail,
        venue: 'Ulu Pandan Room 3'
      })
      expect(response.statusCode).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.newClass).toHaveProperty('students', [])
      expect(response.body.newClass).toHaveProperty('users', [])
      expect(response.body.newClass).toHaveProperty('status', 'Active')
      expect(response.body.newClass).toHaveProperty('className', 'Upstars Class B')
      expect(response.body.newClass).toHaveProperty('classType', 'Tuition')
      expect(response.body.newClass).toHaveProperty('venue', 'Ulu Pandan Room 3')
      expect(response.body.newClass).toHaveProperty('dayAndTime', 'Friday 9PM')
      expect(response.body.newClass).toHaveProperty('startDate', '2018-10-14T06:59:06.643Z')
      expect(response.body.newClass).toHaveProperty('_id')
    })
  })

  describe('get all class with different privileges', () => {
    test('ALL class without token throws generic error', async () => {
      expect.assertions(2)
      const response = await app.get('/class')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({'error': "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know."})
    })

    test('ALL class using superadmin token', async () => {
      expect.assertions(3)
      const response = await app.get('/class').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.activeClasses).toEqual([
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A',
          'classType': 'Tuition',
          'venue': 'Upstars Classroom 1',
          'dayAndTime': 'Wednesday, 3pm',
          '__v': 0
        },
        {
          'status': 'Active',
          '_id': expect.any(String),
          'className': 'Upstars Class B',
          'classType': 'Tuition',
          'venue': 'Ulu Pandan Room 3',
          'dayAndTime': 'Friday 9PM',
          '__v': 0
        }
      ])
      expect(response.body.stoppedClasses).toEqual([
        {
          'status': 'Stopped',
          '_id': '5b97bdc5058d1e1e64d232f3',
          'className': 'Upstars Stopped Class',
          'classType': 'Enrichment',
          'venue': 'Upstars Level 3',
          'dayAndTime': 'nil',
          '__v': 0
        }
      ])
    })

    test('non admin can only GET classes he is in', async () => {
      expect.assertions(3)
      const response = await app.get('/class').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.activeClasses).toEqual([
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A',
          'classType': 'Tuition',
          'venue': 'Upstars Classroom 1',
          'dayAndTime': 'Wednesday, 3pm',
          '__v': 0
        }
      ])
      expect(response.body.stoppedClasses).toEqual([])
    })
  })

  describe('get a class via ID', () => {
    test('invalid ObjectId used for classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/123')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({'error': "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know."})
    })

    test('valid but wrong ObjectId used for classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/5b97b8f2adfb2e018c64d344')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'This class does not exist'})
    })

    test('valid ObjectId used for classId returns class', async () => {
      const classObject = {
        'students': [
          {
            'profile': {
              'name': 'Lingxin  Long'
            },
            '_id': '5b936ce7defc1a592d677008'
          }
        ],
        'users': [
          {
            'profile': {
              'name': 'Mr. Cristian Bartell'
            },
            '_id': '5b9255700333773af993ae9c'
          },
          {
            'profile': {
              'name': 'Wuying  Kong'
            },
            '_id': '5b912ba72b9ec042a58f88a4'
          }
        ],
        'status': 'Active',
        '_id': '5b97b8f2adfb2e018c64d372',
        'className': 'Upstars Class A',
        'classType': 'Tuition',
        'venue': 'Upstars Classroom 1',
        'dayAndTime': 'Wednesday, 3pm',
        'startDate': '2018-10-03T12:36:07.000Z',
        '__v': 0
      }
      expect.assertions(2)
      const response = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(response.statusCode).toBe(200)
      expect(response.body.class).toMatchObject(classObject)
    })
  })

  describe('stopping aka delete a class', () => {
    test('stopping a class without classId', async () => {
      expect.assertions(2)
      const response = await app.delete('/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Please provide at least 1 classId and ensure input is correct.'})
    })

    test('stopping a class with empty classId', async () => {
      expect.assertions(2)
      const response = await app.delete('/class').send({classId: []})
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'Class not found'})
    })

    test('stopping a class using wrong Ids throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/class').send({classId: ['5bc48f55a1b6712584b28533']})
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'Class not found'})
    })

    test('stopping a class using valid Ids returns success', async () => {
      expect.assertions(3)
      const response = await app.delete('/class').send({classId: ['5b97b8f2adfb2e018c64d372']})
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'success': true})
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(classData.body.class).toHaveProperty('status', 'Stopped')
    })
  })

  describe('edit a class by Admin and above', () => {
    const classDetail = {
      className: 'Upstars Class A 2018',
      classType: 'Tuition',
      venue: 'Ulu Pandan Room 2',
      dayAndTime: 'Wednesday, 3pm',
      startDate: '2018-10-03T12:36:07.000Z'
    }
    test('editing a class without any fields', async () => {
      expect.assertions(2)
      const response = await app.put('/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Our server had issues validating your inputs. Please fill in using proper values'})
    })

    test('editing a class with wrong classId', async () => {
      expect.assertions(2)
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d355',
        status: 'Active'
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({'error': 'Class not found. Please try again later'})
    })

    test('editing a class with correct ID but missing fields', async () => {
      expect.assertions(2)
      // Missing status field
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({'error': 'Our server had issues validating your inputs. Please fill in using proper values'})
    })

    test('editing a class with correct ID returns success', async () => {
      expect.assertions(5)
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d372',
        status: 'Active'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({'success': true})
      // The 3 tests below only verify that these 3 fields are edited as intended
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(classData.body.class).toHaveProperty('status', 'Active')
      expect(classData.body.class).toHaveProperty('className', 'Upstars Class A 2018')
      expect(classData.body.class).toHaveProperty('venue', 'Ulu Pandan Room 2')
    })
  })
})
