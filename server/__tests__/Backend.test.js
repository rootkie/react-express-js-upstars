const request = require('supertest')
const app = request('http://localhost:3000/api')
const util = require('../util.js')
const { generateRefresh } = util
const { exec } = require('child_process')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// mongorestore --drop -d tests dump/tests
// ./node_modules/.bin/jest -c __tests__/jest.config.integration.js
let userToken
beforeAll(async () => {
  const response = await app.post('/login').send({ email: 'testuser@upstars.com', password: 'password' })
  userToken = response.body.token
})

afterAll(() => {
  exec('mongorestore --drop -d tests dump/tests')
})

describe('testing auth related API mostly without token', () => {
  describe('login testing', () => {
    test('login with no credentials', async () => {
      expect.assertions(2)
      const response = await app.post('/login')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and password.' })
    })

    test('login with missing password', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: '' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and password.' })
    })

    test('login with missing email', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ password: '' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and password.' })
    })

    test('login with wrong email', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: 'test@upstars.com', password: 'password' })
      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({ 'error': 'Wrong email or password' })
    })

    test('login with wrong password', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: 'testuser@upstars.com', password: 'password123' })
      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({ 'error': 'Wrong email or password' })
    })

    test('login with wrong password and email', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: 'test@upstars.com', password: 'password123' })
      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({ 'error': 'Wrong email or password' })
    })

    test('login with suspended account', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: 'testuser2@upstars.com', password: 'password' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your account has been suspended, please contact the administrator for follow up actions' })
    })

    test('login with unverified account', async () => {
      expect.assertions(2)
      const response = await app.post('/login').send({ email: 'testuser5@upstars.com', password: 'password' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your account has yet to be verified, please verify your email by checking your email account' })
    })

    test('login normally', async () => {
      expect.assertions(3)
      const response = await app.post('/login').send({ email: 'testuser@upstars.com', password: 'password' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refresh')
    })
  })

  describe('x-access-token functionalities', () => {
    let accessToken, expiringAccessToken
    beforeAll(async () => {
      const response = await app.post('/login').send({ email: 'testuser@upstars.com', password: 'password' })
      accessToken = response.body.token
      const user = {
        _id: '5b912ba72b9ec042a58f88a4',
        classes: ['5b97b8f2adfb2e018c64d372'],
        status: 'Active',
        roles: ['Tutor', 'SuperAdmin', 'Admin'],
        name: 'Wuying Kong'
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
      expect(response.body).toHaveProperty('name', 'Wuying Kong')
      expect(response.body).toHaveProperty('_id', '5b912ba72b9ec042a58f88a4')
      expect(response.body).toHaveProperty('classes', ['5b97b8f2adfb2e018c64d372'])
      expect(response.body).toHaveProperty('roles', ['Tutor', 'SuperAdmin', 'Admin'])
    })

    test('expiring token check returns expiring', async () => {
      expect.assertions(6)
      const response = await app.get('/check').set('x-access-token', expiringAccessToken)
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('auth', 'expiring')
      expect(response.body).toHaveProperty('name', 'Wuying Kong')
      expect(response.body).toHaveProperty('_id', '5b912ba72b9ec042a58f88a4')
      expect(response.body).toHaveProperty('classes', ['5b97b8f2adfb2e018c64d372'])
      expect(response.body).toHaveProperty('roles', ['Tutor', 'SuperAdmin', 'Admin'])
    })
  })

  describe('refresh tokens test', () => {
    let refreshToken, deletedUserRefresh
    beforeAll(async () => {
      const response = await app.post('/login').send({ email: 'testuser@upstars.com', password: 'password' })
      refreshToken = response.body.refresh
      // Fake User ID
      const _id = '5b912ba72b9ec042a58f8855'
      deletedUserRefresh = await generateRefresh(_id)
    })

    test('refresh token returns new valid x-access-token', async () => {
      expect.assertions(3)
      const response = await app.post('/refresh').send({ refreshToken })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('token')
      expect(response.body.status).toBe(true)
    })

    test('invalid refresh tokens returns false', async () => {
      expect.assertions(3)
      const response = await app.post('/refresh').send({ refreshToken: refreshToken + 'abc' })
      expect(response.statusCode).toBe(200)
      expect(response.body.token).toBeNull()
      expect(response.body.status).toBe(false)
    })

    test('refresh tokens for invalid users returns false', async () => {
      expect.assertions(3)
      const response = await app.post('/refresh').send({ refreshToken: deletedUserRefresh })
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
      // Best to log into ethereal email account to check the email is really sent out
      email: 'testuser10@upstars.com',
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
      schoolLevel: 'Upstars Secondary',
      password: 'password',
      commencementDate: '2018-09-25T12:53:52+00:00',
      exitDate: '2018-10-25T12:53:52+00:00',
      preferredTimeSlot: ['Tuesday 7-9.30pm'],
      captchaCode: 'anyRandomString'
    }

    // Missing email and password
    const missingUserInfo = {
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
      schoolLevel: 'Upstars Secondary',
      commencementDate: '2018-09-25T12:53:52+00:00',
      exitDate: '2018-10-25T12:53:52+00:00',
      preferredTimeSlot: ['Tuesday 7-9.30pm']
    }

    test('registration working', async () => {
      expect.assertions(1)
      const response = await app.post('/register').send(userData)
      expect(response.statusCode).toBe(201)
    })

    test('duplicate email', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser@upstars.com',
        password: 'password'
      })
      expect(response.statusCode).toBe(409)
      expect(response.body).toEqual({ 'error': 'Email already exists.' })
    })

    test('missing email', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        password: 'password'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email and password that is also at least 6 characters long.' })
    })

    test('missing password', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser10@upstars.com'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email and password that is also at least 6 characters long.' })
    })

    test('Bad Password', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser10@upstars.com',
        password: 'pass'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email and password that is also at least 6 characters long.' })
    })

    test('Suspended User attempting to register', async () => {
      expect.assertions(2)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser2@upstars.com',
        password: 'password'
      })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your account has been suspended. Please contact the administrator for follow up actions' })
    })

    test('Recreating new account for deleted users', async () => {
      expect.assertions(1)
      const response = await app.post('/register').send({
        ...missingUserInfo,
        email: 'testuser6@upstars.com',
        password: 'password',
        captchaCode: 'anyRandomString'
      })
      expect(response.statusCode).toBe(201)
    })
  })

  describe('verify email address exist using links', () => {
    let encodedString
    test('no email token', async () => {
      expect.assertions(2)
      const response = await app.post('/verifyEmail')
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Something went wrong, please try again.' })
    })

    test('empty email token', async () => {
      expect.assertions(2)
      const response = await app.post('/verifyEmail').send({ token: '' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Something went wrong, please try again.' })
    })

    test('broken email token', async () => {
      expect.assertions(2)
      const response = await app.post('/verifyEmail').send({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmFjY2VhNTI1Y2IyYjY4Mjg2ODI3NGQiLCJpYXQiOjE1MzgwNTE3NDl9.nuHfY0bF13LT3qajl91fCycyyh5ZkbrHSvF06iLshqg' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Something went wrong, please try again.' })
    })

    beforeAll(async () => {
      // testuser5@upstars.com used
      const objectToEncode = {
        _id: '5ba8c8cb8e235732b485a60e'
      }
      encodedString = jwt.sign(objectToEncode, process.env.SECRET_EMAIL)
    })

    test('verify email using a valid token', async () => {
      expect.assertions(1)
      const response = await app.post('/verifyEmail').send({ token: encodedString })
      expect(response.statusCode).toBe(200)
    })
  })

  describe('Password Changes by the User', () => {
    test('no POST req body prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and your NRIC number.' })
    })

    test('no email prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword').send({ nric: 'S9255568F' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and your NRIC number.' })
    })

    test('no nric prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword').send({ email: 'testuser3@upstars.com' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and your NRIC number.' })
    })

    test('wrong nric prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword').send({ email: 'testuser3@upstars.com', nric: 'S9255562F' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Wrong email or nric. Please try again' })
    })

    test('wrong email prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword').send({ email: 'testuser4@upstars.com', nric: 'S925556F' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Wrong email or nric. Please try again' })
    })

    test('suspended user prompts errors', async () => {
      expect.assertions(2)
      const response = await app.post('/changepassword').send({ email: 'testuser2@upstars.com', nric: 'S9244567F' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your account has been suspended, please contact the administrator for follow up actions' })
    })

    test('proper requests returns success', async () => {
      expect.assertions(1)
      const response = await app.post('/changepassword').send({ email: 'testuser3@upstars.com', nric: 'S9255568F' })
      expect(response.statusCode).toBe(200)
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
      await app.post('/changepassword').send({ email: 'testuser3@upstars.com', nric: 'S925556F8' })
      token = jwt.sign(objectToEncode, process.env.SECRET_EMAIL, {
        expiresIn: 60 * 30
      })
    })

    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/resetpassword')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There\'s something wrong, please try again.' })
    })

    test('no password throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/resetpassword').send({ token: 'test-token' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There\'s something wrong, please try again.' })
    })

    test('no token throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/resetpassword').send({ password: 'password' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There\'s something wrong, please try again.' })
    })

    test('bad password throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/resetpassword').send({ password: 'pass', token: 'test-token' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a password that is at least 6 characters long.' })
    })

    test('proper reset password returns success', async () => {
      expect.assertions(1)
      const response = await app.post('/resetpassword').send({ password: 'password123', token })
      expect(response.statusCode).toBe(200)
    })
  })

  describe('send new email verification link', () => {
    test('no input fields throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/link')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and nric' })
    })

    test('no nric throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/link').send({ email: 'testuser10@upstars.com' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and nric' })
    })

    test('wrong nric causes empty response', async () => {
      expect.assertions(2)
      const response = await app.post('/link').send({ email: 'testuser10@upstars.com', nric: 'T0423783E' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({})
    })

    test('wrong email causes empty response', async () => {
      expect.assertions(2)
      const response = await app.post('/link').send({ email: 'testuser3@upstars.com', nric: 'T0423783D' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({})
    })

    test('correct fields also return empty but have email sent with link', async () => {
      // Either check nodemon to see if the 'message sent' log is written or go to
      // ethereal email to check if it is really sent
      expect.assertions(2)
      const response = await app.post('/link').send({ email: 'testuser10@upstars.com', nric: 'T0423783D' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({})
    })
  })
})

// There is no need for a x-access-token in development,refer to routeMiddleware.js
// However, some APIs require it, so we will just parse it in
describe('testing admin related APIs', () => {
  describe('retrieve pending users', () => {
    test('get pending users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/pendingUsers')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'users': [{ 'name': 'Lai Ta Toh', 'status': 'Pending', 'roles': ['Tutor'], '_id': '5b96687dfcb4725189fe9efb' }, { 'name': 'Mr. Ho Jin He', 'status': 'Pending', 'roles': ['Tutor'], '_id': '5ba8c8cb8e235732b485a60e' }] })
    })
  })

  describe('retrieve suspended users', () => {
    test('get suspended users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/suspended')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'users': [{ 'name': 'Marie G Kruger', 'status': 'Suspended', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b9255260333773af993ae9b' }] })
    })
  })

  describe('retrieve deleted users', () => {
    test('get deleted users', async () => {
      expect.assertions(2)
      const response = await app.get('/admin/deleted')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'users': [{ '_id': '5c73acb2afcab33a4012ac29', 'name': 'Noh Qing Feng', 'status': 'Deleted', 'roles': ['Tutor'] }] })
    })
  })

  describe('responsive name search', () => {
    test('user - case insensitive', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/cRIs')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [{ 'name': 'Mr. Cristian Bartell', 'status': 'Active', 'roles': ['Tutor'], '_id': '5b9255700333773af993ae9c' }])
      expect(response.body).toHaveProperty('suspendedMatched', [])
      expect(response.body).toHaveProperty('deletedMatched', [])
    })

    test('multiple match', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/G')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [{ 'name': 'Wuying Kong', 'status': 'Active', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b912ba72b9ec042a58f88a4' }])
      expect(response.body).toHaveProperty('suspendedMatched', [{ 'name': 'Marie G Kruger', 'status': 'Suspended', 'roles': ['Tutor', 'SuperAdmin', 'Admin'], '_id': '5b9255260333773af993ae9b' }])
      expect(response.body).toHaveProperty('deletedMatched', [{ '_id': '5c73acb2afcab33a4012ac29', 'name': 'Noh Qing Feng', 'status': 'Deleted', 'roles': ['Tutor'] }])
    })

    test('none match', async () => {
      expect.assertions(5)
      const response = await app.get('/admin/search/admin')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pendingMatched', [])
      expect(response.body).toHaveProperty('activeMatched', [])
      expect(response.body).toHaveProperty('suspendedMatched', [])
      expect(response.body).toHaveProperty('deletedMatched', [])
    })
  })

  describe('mass deletion of users using ID', () => {
    test('no userId provided', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide working userId(s)' })
    })

    test('deleting non-existing user', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user').send({ userId: ['5ba8c8cb8e235732b485a620'] })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'The user you requested to delete does not exist.' })
    })

    test('deleting already deleted user', async () => {
      expect.assertions(2)
      const response = await app.delete('/admin/user').send({ userId: ['5c73acb2afcab33a4012ac29'] })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'The user you requested to delete does not exist.' })
    })

    test('deleting current users', async () => {
      expect.assertions(5)
      const response = await app.delete('/admin/user').send({ userId: ['5b912ba72b9ec042a58f88a4'] })
      expect(response.statusCode).toBe(200)
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user.status).toBe('Deleted')
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372').set('x-access-token', userToken)
      expect(classData.statusCode).toBe(200)
      // The class started with 2 people, leaving with one after the deletion of the user above.
      expect(classData.body.class.users).toEqual([{ '_id': '5b9255700333773af993ae9c', 'name': 'Mr. Cristian Bartell' }])
    })
  })

  describe('changing role and status of user', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'User does not exist' })
    })

    test('no userId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions').send({
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin']
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'User does not exist' })
    })

    test('wrong userId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/admin/userStatusPermissions').send({
        'userId': '5ba8c8cb8e235732b485a620',
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin']
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'User does not exist' })
    })

    test('correct userId shows success and changes classes accordingly', async () => {
      expect.assertions(7)
      const response = await app.post('/admin/userStatusPermissions').send({
        'userId': '5b912ba72b9ec042a58f88a4',
        'newStatus': 'Active',
        'newRoles': ['SuperAdmin', 'Admin']
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'editedClass': { 'n': 1, 'nModified': 1, 'ok': 1 } })
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user).toHaveProperty('status', 'Active')
      expect(userData.body.user).toHaveProperty('roles', ['SuperAdmin', 'Admin'])
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372').set('x-access-token', userToken)
      expect(classData.statusCode).toBe(200)
      expect(classData.body.class.users).toEqual([
        {
          'name': 'Mr. Cristian Bartell',
          '_id': '5b9255700333773af993ae9c'
        },
        {
          'name': 'Wuying Kong',
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
      expect(response.body).toEqual({ 'editedClass': { 'n': 1, 'nModified': 0, 'ok': 1 } })
      const userData = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      expect(userData.statusCode).toBe(200)
      expect(userData.body.user).toHaveProperty('status', 'Active')
      expect(userData.body.user).toHaveProperty('roles', ['SuperAdmin', 'Admin', 'Tutor'])
    })
  })
})

describe('testing class related APIs', () => {
  let lowPrivUserToken
  let classDetail = {
    className: 'Upstars Class B',
    classType: 'Tuition',
    dayAndTime: 'Friday 9PM',
    startDate: '2018-10-14T06:59:06.643Z'
  }
  // This user is in only 1 class and thus should not be able to view every single class available
  beforeAll(async () => {
    const response = await app.post('/login').send({ email: 'testuser3@upstars.com', password: 'password123' })
    lowPrivUserToken = response.body.token
  })

  describe('add a new class', () => {
    test('adding without any fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a class name' })
    })

    test('adding with className but missing remaining fields', async () => {
      expect.assertions(2)
      const response = await app.post('/class').send(classDetail)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There is something wrong with the client input. That is all we know.' })
    })

    test('add duplicate class throws errors', async () => {
      expect.assertions(2)
      const response = await app.post('/class').send({ className: 'Upstars Class A' })
      expect(response.statusCode).toBe(409)
      expect(response.body).toEqual({ 'error': 'Class already exist. Create a new class or edit a current class.' })
    })

    test('correct fields successfully add class', async () => {
      expect.assertions(13)
      const response = await app.post('/class').send({
        ...classDetail,
        venue: 'Ulu Pandan Room 3'
      })
      expect(response.statusCode).toBe(201)
      expect(response.body.newClassId).toEqual(expect.any(String))
      const classDetails = await app.get(`/class/${response.body.newClassId}`)
      expect(classDetails.body.class).toHaveProperty('students', [])
      expect(classDetails.body.class).toHaveProperty('users', [])
      expect(classDetails.body.class).toHaveProperty('status', 'Active')
      expect(classDetails.body.class).toHaveProperty('className', 'Upstars Class B')
      expect(classDetails.body.class).toHaveProperty('classType', 'Tuition')
      expect(classDetails.body.class).toHaveProperty('venue', 'Ulu Pandan Room 3')
      expect(classDetails.body.class).toHaveProperty('dayAndTime', 'Friday 9PM')
      expect(classDetails.body.class).toHaveProperty('startDate', '2018-10-14T06:59:06.643Z')
      expect(classDetails.body.class).toHaveProperty('createdAt')
      expect(classDetails.body.class).toHaveProperty('updatedAt')
      expect(classDetails.body.class).toHaveProperty('__v')
    })
  })

  describe('get all class with different privileges', () => {
    test('ALL class without token throws generic error', async () => {
      expect.assertions(2)
      const response = await app.get('/class')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({ 'error': "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know." })
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
          'dayAndTime': 'Wednesday, 3pm'
        },
        {
          'status': 'Active',
          '_id': expect.any(String),
          'className': 'Upstars Class B',
          'classType': 'Tuition',
          'venue': 'Ulu Pandan Room 3',
          'dayAndTime': 'Friday 9PM'
        }
      ])
      expect(response.body.stoppedClasses).toEqual([
        {
          'status': 'Stopped',
          '_id': '5b97bdc5058d1e1e64d232f3',
          'className': 'Upstars Stopped Class',
          'classType': 'Enrichment',
          'venue': 'Upstars Level 3',
          'dayAndTime': 'nil'
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
          'dayAndTime': 'Wednesday, 3pm'
        }
      ])
      expect(response.body.stoppedClasses).toEqual([])
    })
  })

  describe('get a class via ID', () => {
    test('invalid ObjectId used for classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/123')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('valid but wrong ObjectId used for classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/5b97b8f2adfb2e018c64d344')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'This class does not exist' })
    })

    test('valid ObjectId used for classId returns class', async () => {
      const classObject = {
        'students': [
          {
            'name': 'Lingxin  Long',
            '_id': '5b936ce7defc1a592d677008'
          }
        ],
        'users': [
          {
            'name': 'Mr. Cristian Bartell',
            '_id': '5b9255700333773af993ae9c'
          },
          {
            'name': 'Wuying Kong',
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
        '__v': 2,
        'createdAt': expect.any(String),
        'updatedAt': expect.any(String)
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
      expect(response.body).toEqual({ 'error': 'Please provide at least 1 classId and ensure all values are correct.' })
    })

    test('stopping a class with empty classId', async () => {
      expect.assertions(2)
      const response = await app.delete('/class').send({ classId: [] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide at least 1 classId and ensure all values are correct.' })
    })

    test('stopping a class using wrong Ids throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/class').send({ classId: ['5bc48f55a1b6712584b28533'] })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'Class not found' })
    })

    test('stopping a class using valid Ids returns success', async () => {
      expect.assertions(2)
      const response = await app.delete('/class').send({ classId: ['5b97b8f2adfb2e018c64d372'] })
      expect(response.statusCode).toBe(200)
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
      expect(response.body).toEqual({ 'error': 'Our server had issues validating your inputs. Please fill in using proper values' })
    })

    test('editing a class with wrong classId', async () => {
      expect.assertions(2)
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d355',
        status: 'Active'
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'Class not found. Please try again later' })
    })

    test('editing a class with correct ID but missing fields', async () => {
      expect.assertions(2)
      // Missing status field
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Our server had issues validating your inputs. Please fill in using proper values' })
    })

    test('editing a class with correct ID returns success', async () => {
      expect.assertions(4)
      const response = await app.put('/class').send({
        ...classDetail,
        classId: '5b97b8f2adfb2e018c64d372',
        status: 'Active'
      })
      expect(response.statusCode).toBe(200)
      // The 3 tests below only verify that these 3 fields are edited as intended
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(classData.body.class).toHaveProperty('status', 'Active')
      expect(classData.body.class).toHaveProperty('className', 'Upstars Class A 2018')
      expect(classData.body.class).toHaveProperty('venue', 'Ulu Pandan Room 2')
    })
  })
})

describe('testing user side APIs', () => {
  let lowPrivUserToken
  // Similarly, for getAllUser, this non-admin user can only see his / her own account details
  beforeAll(async () => {
    const response = await app.post('/login').send({ email: 'testuser3@upstars.com', password: 'password123' })
    lowPrivUserToken = response.body.token
  })

  describe('get all users functionality', () => {
    test('non-admin personnel only retrieves his own profile', async () => {
      const userData = {
        'users': [
          {
            'name': 'Mr. Cristian Bartell',
            'gender': 'M',
            'nric': 'S9255568F',
            'dob': '2004-03-09T16:00:00.000Z',
            'status': 'Active',
            'roles': [
              'Tutor'
            ],
            '_id': '5b9255700333773af993ae9c'
          }
        ]
      }
      expect.assertions(2)
      const response = await app.get('/users').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject(userData)
    })

    test('admin users retrieves everyone\'s profile', async () => {
      const allUserData = {
        'users': [
          {
            'name': 'Mr. Cristian Bartell',
            'gender': 'M',
            'nric': 'S9255568F',
            'dob': '2004-03-09T16:00:00.000Z',
            'status': 'Active',
            'roles': [
              'Tutor'
            ],
            '_id': '5b9255700333773af993ae9c'
          },
          {
            'name': 'Wuying Kong',
            'gender': 'M',
            'nric': 'S9234567F',
            'dob': '2004-03-09T16:00:00.000Z',
            'status': 'Active',
            'roles': [
              'SuperAdmin',
              'Admin',
              'Tutor'
            ],
            '_id': '5b912ba72b9ec042a58f88a4'
          }
        ]
      }
      expect.assertions(2)
      const response = await app.get('/users').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body).toMatchObject(allUserData)
    })
  })

  describe('viewing a single user data', () => {
    const userFullData = {
      'name': 'Mr. Cristian Bartell',
      'gender': 'M',
      'nric': 'S9255568F',
      'nationality': 'singaporean',
      'dob': '2004-03-09T16:00:00.000Z',
      'address': '486 Schmitt Drive',
      'postalCode': 623411,
      'handphone': 84720133,
      'homephone': 60437898,
      'schoolClass': 'Sec 3-3',
      'schoolLevel': 'UPStars Secondary',
      'fatherName': 'Sam Kong',
      'fatherEmail': 'samkong@upstars.com',
      'fatherOccupation': 'Manager',
      'motherName': 'Yahui Geng',
      'motherOccupation': 'Poultry cutter',
      'motherEmail': 'yahuigeng@upstars.com',
      'hobbies': 'Running. Studying',
      'careerGoal': 'Economist',
      'formalEducation': [
        {
          'dateFrom': '2014-12-31T16:00:00.000Z',
          'dateTo': '2015-12-30T16:00:00.000Z',
          'school': 'Upstars Secondary',
          'highestLevel': 'Sec 4'
        }
      ],
      'coursesSeminar': [
        {
          'year': 2016,
          'courseAndObjective': 'Upstars Institute'
        }
      ],
      'achievements': [
        {
          'dateFrom': '2018-09-06T13:43:33.359Z',
          'dateTo': '2018-09-06T13:43:33.359Z',
          'organisation': 'Upstars',
          'description': 'Great performance award'
        }
      ],
      'cca': [
        {
          'dateFrom': '2015-01-01T16:00:00.000Z',
          'dateTo': '2015-12-30T16:00:00.000Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'cip': [
        {
          'dateFrom': '2015-01-31T16:00:00.000Z',
          'dateTo': '2018-09-06T13:45:56.027Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'workInternExp': [
        {
          'dateFrom': '2015-01-01T16:00:00.000Z',
          'dateTo': '2018-09-06T13:46:12.164Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'languages': 'English, Chinese',
      'subjects': 'Math, Science, English, Chinese',
      'interests': 'Everything',
      'preferredTimeSlot': [
        'Tuesday 7-9.30pm',
        'Wednesday 7-9.30pm'
      ],
      'status': 'Active',
      'roles': [
        'Tutor'
      ],
      'classes': [
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        }
      ],
      '_id': '5b9255700333773af993ae9c',
      'exitDate': '2018-12-27T16:00:00.000Z',
      '__v': 2
    }

    test('lowPriv user does not have auth to view other users', async () => {
      expect.assertions(2)
      const response = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your client does not have the permissions to access this function.' })
    })

    test('non-admin user is able to view personal account', async () => {
      expect.assertions(2)
      const response = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.user).toMatchObject(userFullData)
    })

    test('admin user is able to view anyone and see admin details', async () => {
      expect.assertions(2)
      const response = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.user).toMatchObject({
        ...userFullData,
        admin: {
          'interviewDate': '2018-09-06T16:00:00.000Z',
          'interviewNotes': 'Great person',
          'adminNotes': 'Great!',
          'commencementDate': '2018-09-06T16:00:00.000Z'
        }
      })
    })

    test('admin user cannot access non existent user', async () => {
      expect.assertions(2)
      const response = await app.get('/users/5b9255700333773af993ae20').set('x-access-token', userToken)
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'User does not exist. Please try again' })
    })
  })

  describe('retrieving a user detail via responsive name API', () => {
    test('non-admin can only find themselves no matter the query', async () => {
      expect.assertions(2)
      const response = await app.get('/usersResponsive/crist').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.users).toEqual([
        {
          'name': 'Mr. Cristian Bartell',
          '_id': '5b9255700333773af993ae9c'
        }
      ])
    })

    test('non-admin can only find themselves no matter the query 2', async () => {
      expect.assertions(2)
      const response = await app.get('/usersResponsive/anything').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.users).toEqual([
        {
          'name': 'Mr. Cristian Bartell',
          '_id': '5b9255700333773af993ae9c'
        }
      ])
    })

    test('admin can obtain any active members details 1', async () => {
      expect.assertions(2)
      const response = await app.get('/usersResponsive/ch').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.users).toEqual([])
    })

    test('admin can obtain any active members details 2', async () => {
      expect.assertions(2)
      const response = await app.get('/usersResponsive/cRIS').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.users).toEqual([
        {
          'name': 'Mr. Cristian Bartell',
          '_id': '5b9255700333773af993ae9c'
        }
      ])
    })

    test('admin can obtain any active members details 3', async () => {
      expect.assertions(2)
      const response = await app.get('/usersResponsive/i').set('x-access-token', userToken)
      expect(response.statusCode).toBe(200)
      expect(response.body.users).toEqual([
        {
          'name': 'Mr. Cristian Bartell',
          '_id': '5b9255700333773af993ae9c'
        },
        {
          'name': 'Wuying Kong',
          '_id': '5b912ba72b9ec042a58f88a4'
        }
      ])
    })
  })

  describe('changing user password', () => {
    test('changing password without any fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/users/changePassword')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide userId, old password and new password. Ensure password is at least 6 characters long.' })
    })

    test('changing password with missing fields throws error', async () => {
      expect.assertions(2)
      // Missing new password
      const response = await app.post('/users/changePassword').send({ userId: '5b9255700333773af993ae9c', oldPassword: 'password123' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide userId, old password and new password. Ensure password is at least 6 characters long.' })
    })

    test('changing password with bad password throws error', async () => {
      expect.assertions(2)
      // Less than the basic 6 characters
      const response = await app.post('/users/changePassword').send({ userId: '5b9255700333773af993ae9c', oldPassword: 'password123', newPassword: 'pass' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide userId, old password and new password. Ensure password is at least 6 characters long.' })
    })

    test('changing password with non-existent userID throws error', async () => {
      expect.assertions(2)
      // Less than the basic 6 characters
      const response = await app.post('/users/changePassword').send({ userId: '5b9255700333773af993a11c', oldPassword: 'password123', newPassword: 'password' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'User does not exist!' })
    })

    test('changing password with wrong oldPassword throws error', async () => {
      expect.assertions(2)
      // Actual is password123
      const response = await app.post('/users/changePassword').send({ userId: '5b9255700333773af993ae9c', oldPassword: 'password12345', newPassword: 'password' })
      expect(response.statusCode).toBe(401)
      expect(response.body).toEqual({ 'error': 'Your old password does not match. Please try again' })
    })

    test('changing password properly returns success', async () => {
      expect.assertions(2)
      const response = await app.post('/users/changePassword').send({ userId: '5b9255700333773af993ae9c', oldPassword: 'password123', newPassword: 'password' })
      expect(response.statusCode).toBe(200)
      const user = await app.post('/login').send({ email: 'testuser3@upstars.com', password: 'password' })
      expect(user.body).toHaveProperty('token')
    })
  })

  describe('editing user particulars', () => {
    const incompleteUserDetails = {
      'name': 'Mr. Cristian Bartell',
      'gender': 'M',
      'nric': 'S9255568F',
      'nationality': 'singaporean',
      'dob': '2004-03-09T16:00:00.000Z',
      'address': '486 Schmitt Drive',
      'postalCode': 623411,
      'handphone': 84720133,
      'homephone': 60437898,
      'schoolClass': 'Sec 3-4',
      'schoolLevel': 'UPStars Secondary',
      'fatherName': 'Sam Kong',
      'fatherEmail': 'samkong@upstars.com',
      'fatherOccupation': 'Manager',
      'motherName': 'Yahui Geng',
      'motherOccupation': 'Poultry cutter',
      'motherEmail': 'yahuigeng@upstars.com',
      'hobbies': 'Running. Studying',
      'careerGoal': 'Economist',
      'formalEducation': [
        {
          'dateFrom': '2014-12-31T16:00:00.000Z',
          'dateTo': '2015-12-30T16:00:00.000Z',
          'school': 'Upstars Secondary',
          'highestLevel': 'Sec 4'
        }
      ],
      'coursesSeminar': [
        {
          'year': 2016,
          'courseAndObjective': 'Upstars Institute'
        }
      ],
      'achievements': [
        {
          'dateFrom': '2018-09-06T13:43:33.359Z',
          'dateTo': '2018-09-06T13:43:33.359Z',
          'organisation': 'Upstars',
          'description': 'Great performance award'
        }
      ],
      'cca': [
        {
          'dateFrom': '2015-01-01T16:00:00.000Z',
          'dateTo': '2015-12-30T16:00:00.000Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'cip': [
        {
          'dateFrom': '2015-01-31T16:00:00.000Z',
          'dateTo': '2018-09-06T13:45:56.027Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'workInternExp': [
        {
          'dateFrom': '2015-01-01T16:00:00.000Z',
          'dateTo': '2018-09-06T13:46:12.164Z',
          'organisation': 'Upstars',
          'rolePosition': 'Volunteer'
        }
      ],
      'languages': 'English, Chinese',
      'subjects': 'Math, Science, English, Chinese',
      'interests': 'Everything',
      'preferredTimeSlot': [
        'Tuesday 7-9.30pm',
        'Wednesday 7-9.30pm'
      ],
      'exitDate': '2018-12-27T16:00:00.000Z'
    }

    test('editing without userID throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/users').set('x-access-token', lowPrivUserToken)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a userId' })
    })

    test('non-admin editing others account throws error', async () => {
      expect.assertions(2)
      // UserId belongs to testuser@upstars.com
      const response = await app.post('/users').set('x-access-token', lowPrivUserToken).send({
        ...incompleteUserDetails,
        userId: '5b912ba72b9ec042a58f88a4' })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your client does not have the permissions to access this function.' })
    })

    test('non-admin editing own account returns success', async () => {
      expect.assertions(2)
      const response = await app.post('/users').set('x-access-token', lowPrivUserToken).send({
        ...incompleteUserDetails,
        userId: '5b9255700333773af993ae9c' })
      expect(response.statusCode).toBe(200)
      const userData = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', lowPrivUserToken)
      // Instead of Class 3-3
      expect(userData.body).toHaveProperty('user.schoolClass', 'Sec 3-4')
    })

    test('admin editing other account returns success', async () => {
      expect.assertions(2)
      const response = await app.post('/users').set('x-access-token', userToken).send({
        ...incompleteUserDetails,
        userId: '5b9255700333773af993ae9c',
        admin: {
          'interviewDate': '2018-09-06T16:00:00.000Z',
          'interviewNotes': 'Great person with strong ambition',
          'adminNotes': 'Would become a great tutor. Classification: Tutor',
          'commencementDate': '2018-09-06T16:00:00.000Z'
        }
      })
      expect(response.statusCode).toBe(200)
      const userData = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', userToken)
      expect(userData.body.user.admin).toEqual({
        'interviewDate': '2018-09-06T16:00:00.000Z',
        'interviewNotes': 'Great person with strong ambition',
        'adminNotes': 'Would become a great tutor. Classification: Tutor',
        'commencementDate': '2018-09-06T16:00:00.000Z'
      })
    })
  })

  describe('deleting users from class', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('no classId throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users/class').send({ userIds: [] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('Bad classId throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users/class').send({ userIds: [], classId: '123' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('correct classId and empty userId succeed', async () => {
      expect.assertions(4)
      const response = await app.delete('/users/class').send({ userIds: [], classId: '5b97b8f2adfb2e018c64d372' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('class.students', ['5b936ce7defc1a592d677008'])
      expect(response.body).toHaveProperty('class.users', [
        '5b9255700333773af993ae9c',
        '5b912ba72b9ec042a58f88a4'
      ])
      expect(response.body).toHaveProperty('users.nModified', 0)
    })

    test('correct classId and userId succeed', async () => {
      expect.assertions(6)
      // We need to check with the respective users if their class list is also updated
      const response = await app.delete('/users/class').send({
        userIds: ['5b9255700333773af993ae9c', '5b912ba72b9ec042a58f88a4'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('class.students', ['5b936ce7defc1a592d677008'])
      expect(response.body).toHaveProperty('class.users', [])
      expect(response.body).toHaveProperty('users.nModified', 2)
      const adminUser = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      const normalUser = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', userToken)
      expect(adminUser.body).toHaveProperty('user.classes', [])
      expect(normalUser.body).toHaveProperty('user.classes', [])
    })
  })

  describe('adding users to class', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/users/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('no classId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/users/class').send({ userIds: [] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('Bad classId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/users/class').send({ userIds: [], classId: '123' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('correct classId returns success', async () => {
      expect.assertions(4)
      const response = await app.post('/users/class').send({
        userIds: [],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('class.students', ['5b936ce7defc1a592d677008'])
      expect(response.body).toHaveProperty('class.users', [])
      expect(response.body).toHaveProperty('users.nModified', 0)
    })

    test('correct classId and userIds returns success', async () => {
      expect.assertions(6)
      const response = await app.post('/users/class').send({
        userIds: ['5b9255700333773af993ae9c', '5b912ba72b9ec042a58f88a4'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('class.students', ['5b936ce7defc1a592d677008'])
      expect(response.body).toHaveProperty('class.users', [
        '5b9255700333773af993ae9c',
        '5b912ba72b9ec042a58f88a4'
      ])
      expect(response.body).toHaveProperty('users.nModified', 2)
      const adminUser = await app.get('/users/5b912ba72b9ec042a58f88a4').set('x-access-token', userToken)
      const normalUser = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', userToken)
      expect(adminUser.body).toHaveProperty('user.classes', [
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        }
      ])
      expect(normalUser.body).toHaveProperty('user.classes', [
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        }
      ])
    })
  })

  describe('deleting their own account', () => {
    test('deleting without userId throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a userId and ensure input is correct' })
    })

    test('non-admin deleting other accounts throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users')
        .set('x-access-token', lowPrivUserToken)
        .send({ userId: '5b912ba72b9ec042a58f88a4'
        })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your client does not have the permissions to access this function.' })
    })

    test('admin deleting non-existent account throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/users')
        .set('x-access-token', userToken)
        .send({ userId: '5b912ba72b9ec042a58f8888'
        })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'The user you requested to delete does not exist.' })
    })

    test('non-admin deleting own account succeed', async () => {
      expect.assertions(3)
      const response = await app.delete('/users')
        .set('x-access-token', lowPrivUserToken)
        .send({ userId: '5b9255700333773af993ae9c'
        })
      expect(response.statusCode).toBe(200)
      const user = await app.get('/users/5b9255700333773af993ae9c').set('x-access-token', userToken)
      // Also make sure class has the user list updated
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(user.body).toHaveProperty('user.status', 'Deleted')
      expect(classData.body.class.users).toEqual([
        {
          'name': 'Wuying Kong',
          '_id': '5b912ba72b9ec042a58f88a4'
        }
      ])
    })
  })

  describe('send new verify email links', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/link')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and nric' })
    })

    test('no nric throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/link').send({ nric: 'S9237776F' })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an email address and nric' })
    })

    test('normal email returns empty', async () => {
      expect.assertions(2)
      const response = await app.post('/link').send({ email: 'testuser5@upstars.com', nric: 'S9237776F' })
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({})
    })
  })
})

describe('testing student side APIs', () => {
  const studentBasicData = {
    'name': 'Laa Huu Min',
    'icNumber': 'T0240435J',
    'dob': '2002-04-18T16:00:00.000Z',
    'address': 'Singapore RedHill Block 377A #03-77 Lorong 7',
    // 'gender': 'F',
    'nationality': 'Singaporean',
    'classLevel': 'Secondary 4',
    'schoolName': 'Upstars Secondary',
    'fatherName': 'Lai Ming Yuan',
    'fatherIcNumber': 'S7571632Z',
    'fatherNationality': 'citizen',
    'fatherContactNumber': '94623272',
    'fatherEmail': 'laimingyuan@upstars.com',
    'fatherOccupation': 'Teacher',
    'fatherIncome': 4000,
    'motherName': 'Jin Rui Tong',
    'motherIcNumber': 'S7904993Z',
    'motherNationality': 'pr',
    'motherContactNumber': '84722333',
    'motherEmail': 'jinruitong@upstars.com',
    'motherOccupation': 'Housewife',
    'motherIncome': 0,
    'otherFamily': [
      {
        'name': 'Lai Ruu Meng',
        'relationship': 'Brother',
        'age': '12'
      }
    ],
    'fas': [
      'FSC'
    ],
    'fsc': 'Singapore FSC',
    'tuition': [
      'Private'
    ],
    'academicInfo': [
      {
        'year': 2018,
        'term': 1,
        'english': 78,
        'math': 76,
        'motherTongue': 78,
        'science': 76,
        'overall': 77
      },
      {
        'year': 2018,
        'term': 2,
        'english': 65,
        'math': 66,
        'motherTongue': 65,
        'science': 66,
        'overall': 66
      },
      {
        'year': 2018,
        'term': 3,
        'english': 61,
        'math': 63,
        'motherTongue': 63,
        'science': 61,
        'overall': 62
      }
    ],
    'captchaCode': '03AMGVjXhPIIXARot4pzcGC0avvZ2KKtZKNEA936e_HCX24vTbiaHz-eFV5_90NrbdyJ8lgtYD3lt0DPzrZm84u10Lx4Goc-a_Ev2SWp7kodbKtxJzSEoP7TYdY9SsaRRKVtdtgATZe6Y8jEKYfxKFXyLKAuEAu5b5wCTK6UZF-mF6TlxAMlh0p8sVSPenc6-HV9WIF90tX9xLg5QVyd91O8iaKcnCz33_Nd-rbM2tiGv1wUPojRr87curV8wxEzcpVR929MoiAxu663x7lOcQoSWzeqrJyMOG1A'
  }
  describe('get all active students', () => {
    test('everyone should retrieve all students profile', async () => {
      const students = [
        {
          'name': 'Lingxin  Long',
          'icNumber': 'T0299228D',
          'dob': '2002-09-04T16:00:00.000Z',
          'gender': 'F',
          '_id': '5b936ce7defc1a592d677008'
        },
        {
          'name': 'Yi Jia Yi',
          'icNumber': 'T0416861A',
          'dob': '2004-03-01T16:00:00.000Z',
          'gender': 'F',
          '_id': '5b9674ef22deaf1ee1aa4dc1'
        }
      ]
      expect.assertions(2)
      const response = await app.get('/students')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ students })
    })
  })

  describe('get all students who are not active', () => {
    test('API should be working', async () => {
      expect.assertions(2)
      const students = [
        {
          'name': 'Student Suspended',
          'icNumber': 'T0299448D',
          'dob': '2002-09-04T16:00:00.000Z',
          'gender': 'F',
          'status': 'Suspended',
          '_id': '5b94e4ca97a4b26f4dbaf26e'
        }
      ]
      const response = await app.get('/otherStudents')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ students })
    })
  })

  describe('get individual student', () => {
    test('bad studentId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/students/123')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({ 'error': "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know." })
    })

    test('non-existent studentId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/students/5b936ce7defc1a592d677121')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'Student does not exist. Please try again' })
    })

    test('correct studentId returns all values', async () => {
      expect.assertions(30)
      const response = await app.get('/students/5b936ce7defc1a592d677008')
      expect(response.statusCode).toBe(200)
      const list = ['name', 'icNumber', 'dob', 'gender', 'address', 'classLevel', 'schoolName', 'fatherName', 'fatherIcNumber', 'fatherNationality', 'fatherEmail', 'fatherOccupation', 'fatherContactNumber', 'motherName', 'motherIcNumber', 'motherNationality', 'motherEmail', 'motherOccupation', 'motherContactNumber', 'motherIncome', 'otherFamily', 'fas', 'fsc', 'tuition', 'academicInfo', 'classes', 'admin']
      for (let property of list) {
        expect(response.body).toHaveProperty(`student.${property}`)
      }
      expect(response.body).toHaveProperty('student.status', 'Active')
      expect(response.body).toHaveProperty('student._id', '5b936ce7defc1a592d677008')
    })
  })

  describe('get active students responsively by name', () => {
    test('API match responsively', async () => {
      expect.assertions(2)
      const response = await app.get('/studentsResponsive/abc')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'studentsFiltered': [] })
    })

    test('API match case insensitive', async () => {
      expect.assertions(2)
      const response = await app.get('/studentsResponsive/NGx')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'studentsFiltered': [{ 'name': 'Lingxin  Long', '_id': '5b936ce7defc1a592d677008' }] })
    })
  })

  describe('get non-active students responsively by name', () => {
    test('API match responsively', async () => {
      expect.assertions(2)
      const response = await app.get('/otherStudentsResponsive/abc')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'studentsFiltered': [] })
    })

    test('API match case insensitive', async () => {
      expect.assertions(2)
      const response = await app.get('/otherStudentsResponsive/uDEn')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'studentsFiltered': [{ 'name': 'Student Suspended', '_id': '5b94e4ca97a4b26f4dbaf26e' }] })
    })
  })

  describe('adding student API', () => {
    test('missing fields throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There is something wrong with the client input. That is all we know.' })
    })

    test('registration success', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData,
        'name': 'Laa Huu Min',
        'icNumber': 'T0240435J',
        'dob': '2002-04-18T16:00:00.000Z',
        'address': 'Singapore RedHill Block 377A #03-77 Lorong 7',
        'gender': 'F',
        'nationality': 'Singaporean',
        'classLevel': 'Secondary 4',
        'schoolName': 'Upstars Secondary'
      })
      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({ 'newStudent': true })
    })

    test('duplicate account throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData,
        'name': 'Laa Huu Min',
        'icNumber': 'T0240435J',
        'dob': '2002-04-18T16:00:00.000Z',
        'address': 'Singapore RedHill Block 377A #03-77 Lorong 7',
        'gender': 'F',
        'nationality': 'Singaporean',
        'classLevel': 'Secondary 4',
        'schoolName': 'Upstars Secondary'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Account already exist. If this is a mistake please contact our system admin.' })
    })
  })

  describe('admin API to add student', () => {
    const admin = {
      interviewDate: '2018-10-30T14:20:20+00:00',
      interviewNotes: 'Great Student',
      commencementDate: '2018-11-03T00:00:00+00:00',
      adminNotes: 'Will make him a model student',
      exitDate: '',
      exitReason: ''
    }

    test('missing fields throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData,
        admin
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There is something wrong with the client input. That is all we know.' })
    })

    test('registration success', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData,
        admin,
        'name': 'Lao Shu Min',
        'icNumber': 'T0188435J',
        'dob': '2001-11-10T16:00:00.000Z',
        'address': 'Singapore RedHill Block 377A #04-77 Lorong 7',
        'gender': 'F',
        'nationality': 'Singaporean',
        'classLevel': 'Sec 5-1',
        'schoolName': 'Upstars Sec'
      })
      expect(response.statusCode).toBe(201)
      expect(response.body).toEqual({ 'newStudent': expect.any(String) })
    })

    test('duplicate account throw error', async () => {
      expect.assertions(2)
      const response = await app.post('/students').send({
        ...studentBasicData,
        'name': 'Lao Shu Min',
        'icNumber': 'T0188435J',
        'dob': '2001-11-10T16:00:00.000Z',
        'address': 'Singapore RedHill Block 377A #04-77 Lorong 7',
        'gender': 'F',
        'nationality': 'Singaporean',
        'classLevel': 'Sec 5-1',
        'schoolName': 'Upstars Sec'
      })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Account already exist. If this is a mistake please contact our system admin.' })
    })
  })

  describe('deleting students from a class', () => {
    test('deleting without any fields', async () => {
      expect.assertions(2)
      const response = await app.delete('/students/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('deleting without classId', async () => {
      expect.assertions(2)
      const response = await app.delete('/students/class').send({ 'studentIds': ['5b936ce7defc1a592d677008'] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('wrong classId returns null', async () => {
      expect.assertions(3)
      const response = await app.delete('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677008'],
        classId: '5b97b8f2adfb2e018c64d123'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('class', null)
      expect(response.body.studentsRemoved).toHaveProperty('nModified', 1)
    })

    test('wrong studentId returns none modified', async () => {
      expect.assertions(3)
      const response = await app.delete('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677123'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body.class).toHaveProperty('students', ['5b936ce7defc1a592d677008'])
      expect(response.body.studentsRemoved).toHaveProperty('nModified', 0)
    })

    test('correct parameters returns success', async () => {
      expect.assertions(4)
      const response = await app.delete('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677008'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body.class).toHaveProperty('students', [])
      expect(response.body.studentsRemoved).toHaveProperty('nModified', 1)

      const studentData = await app.get('/students/5b936ce7defc1a592d677008')
      expect(studentData.body.student).toHaveProperty('classes', [])
    })
  })

  describe('adding students to a class', () => {
    test('adding without any fields', async () => {
      expect.assertions(2)
      const response = await app.post('/students/class')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('adding without classId', async () => {
      expect.assertions(2)
      const response = await app.post('/students/class').send({ 'studentIds': ['5b936ce7defc1a592d677008'] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('wrong classId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677008'],
        classId: '5b97b8f2adfb2e018c64d123'
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'Please provide an existing class' })
    })

    test('wrong studentId returns none modified', async () => {
      expect.assertions(3)
      const response = await app.post('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677123'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body.class).toHaveProperty('students', ['5b936ce7defc1a592d677123'])
      expect(response.body.students).toHaveProperty('nModified', 0)
    })

    test('correct parameters returns success', async () => {
      expect.assertions(4)
      const response = await app.post('/students/class').send({
        'studentIds': ['5b936ce7defc1a592d677008'],
        classId: '5b97b8f2adfb2e018c64d372'
      })
      expect(response.statusCode).toBe(200)
      expect(response.body.class).toHaveProperty('students', ['5b936ce7defc1a592d677123', '5b936ce7defc1a592d677008'])
      expect(response.body.students).toHaveProperty('nModified', 1)

      const studentData = await app.get('/students/5b936ce7defc1a592d677008')
      expect(studentData.body.student.classes).toEqual([
        {
          'status': 'Active',
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        }
      ])
    })
  })

  describe('deleting a student by changing status to deleted', () => {
    test('deleting student without any fields', async () => {
      expect.assertions(2)
      const response = await app.delete('/students')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a studentId and ensure all values are correct' })
    })

    test('deleting without proper studentId', async () => {
      expect.assertions(2)
      const response = await app.delete('/students').send({ studentId: [] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a studentId and ensure all values are correct' })
    })

    test('deleting with wrong studentId', async () => {
      expect.assertions(2)
      const response = await app.delete('/students').send({ studentId: ['5b936ce7defc1a592d677001'] })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'The student(s) you requested to delete does not exist.' })
    })

    test('deleting with malfunctioned studentId', async () => {
      expect.assertions(2)
      const response = await app.delete('/students').send({ studentId: ['5b936ce7defc1a592d6770021'] })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a studentId and ensure all values are correct' })
    })

    test('deleting mass number of studentId returns success', async () => {
      expect.assertions(2)
      const response = await app.delete('/students').send({ studentId: ['5b936ce7defc1a592d677008', '5b9674ef22deaf1ee1aa4dc1'] })
      expect(response.statusCode).toBe(200)

      // Check if the respective classes have already removed them from the class list
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(classData.body.class).toHaveProperty('students', [])
    })
  })

  describe('edit a student data', () => {
    let editStudentData = {
      'name': 'Lingxin  Long',
      'icNumber': 'T0299228D',
      'dob': '2002-09-04T16:00:00.000Z',
      'address': 'Upstars Road 123',
      'gender': 'F',
      'nationality': 'Singaporean',
      'classLevel': 'Primary 6',
      // Edited the school name
      'schoolName': 'Upstars Primary School',
      'fatherName': 'Long Lai La',
      'fatherIcNumber': 'S7382913D',
      'fatherNationality': 'citizen',
      'fatherEmail': 'longlaila@upstars.com',
      'fatherOccupation': 'Manager',
      'fatherContactNumber': 91231234,
      'fatherIincome': 5000,

      'motherName': 'Foo Fa Hui',
      'motherIcNumber': 'S7892838F',
      'motherNationality': 'citizen',
      'motherEmail': 'foofahui@upstars.com',
      'motherOccupation': 'Housewife',
      'motherContactNumber': 81231234,
      'motherIncome': 0,

      'fas': [
        'MOE'
      ],
      'tuition': [
        'CDAC',
        'Mendaki',
        'Private'
      ],
      'academicInfo': [
        {
          'year': 2018,
          'term': 3,
          'english': 60,
          'math': 60,
          'motherTongue': 60,
          'science': 60,
          'overall': 60
        },
        {
          'year': 2018,
          'term': 2,
          'english': 65,
          'math': 65,
          'motherTongue': 65,
          'science': 65,
          'overall': 65
        }
      ],
      'fsc': 'ABC FSC',

      'admin': {
        'interviewNotes': 'Good!',
        'adminNotes': 'Good!',
        'interviewDate': '2018-09-08T16:00:00.000Z',
        'commencementDate': '2018-09-08T16:00:00.000Z',
        'exitDate': null
      },
      'status': 'Active',
      // 'studentId': '5b936ce7defc1a592d677008',
      'otherFamily': [
        {
          'name': 'Long Lai Le',
          'relationship': 'Brother',
          'age': 12
        }
      ]
    }
    test('missing body fields throws error', async () => {
      expect.assertions(2)
      const response = await app.put('/students')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a studentId' })
    })

    test('missing studentId throws error', async () => {
      expect.assertions(2)
      const response = await app.put('/students').send(editStudentData)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a studentId' })
    })

    test('non existent student throws error', async () => {
      expect.assertions(2)
      const response = await app.put('/students').send({
        ...editStudentData,
        studentId: '5bd853dfc5cdec7794960abc'
      })
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'The student you requested to edit does not exist.' })
    })

    test('proper edit changes classes and students', async () => {
      expect.assertions(3)
      const response = await app.put('/students').send({
        ...editStudentData,
        studentId: '5b936ce7defc1a592d677008'
      })
      expect(response.statusCode).toBe(200)

      // Check class and personal details
      const userData = await app.get('/students/5b936ce7defc1a592d677008')
      expect(userData.body.student).toHaveProperty('schoolName', 'Upstars Primary School')
      const classData = await app.get('/class/5b97b8f2adfb2e018c64d372')
      expect(classData.body.class.students).toEqual([
        {
          'name': 'Lingxin  Long',
          '_id': '5b936ce7defc1a592d677008'
        }
      ])
    })
  })
})

describe('testing attendance related APIs', () => {
  let lowPrivUserToken
  beforeAll(async () => {
    const response = await app.post('/login').send({ email: 'testuser4@upstars.com', password: 'password' })
    lowPrivUserToken = response.body.token
  })
  describe('get a single attendance by ID', () => {
    test('bad attendance ID throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/123')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({ 'error': "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know." })
    })

    test('non existent ID returns empty', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/5b990733cef48424966ed012')
      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual({ 'attendances': null })
    })

    test('working ID returns details', async () => {
      expect.assertions(8)
      const response = await app.get('/attendance/5b990733cef48424966ed0eb')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances).toHaveProperty('_id', '5b990733cef48424966ed0eb')
      expect(response.body.attendances).toHaveProperty('class.className', 'Upstars Class A 2018')
      expect(response.body.attendances).toHaveProperty('date', '2018-09-18T16:00:00.000Z')
      expect(response.body.attendances).toHaveProperty('type', 'Class')
      expect(response.body.attendances).toHaveProperty('hours', 4)
      expect(response.body.attendances.students).toEqual([
        {
          'student': {
            'name': 'Lingxin  Long',
            '_id': '5b936ce7defc1a592d677008'
          },
          'status': 0
        }
      ])
      expect(response.body.attendances.users).toEqual([
        {
          'user': {
            'name': 'Wuying Kong',
            '_id': '5b912ba72b9ec042a58f88a4'
          },
          'status': 1
        }
      ])
    })
  })

  describe('get attendance filter by class and date', () => {
    const foundAttendances = [
      {
        '_id': '5b99073ecef48424966ed0f9',
        'class': {
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        },
        'date': '2018-09-25T16:00:00.000Z',
        'type': 'Class',
        'hours': 2,
        '__v': 0
      },
      {
        '_id': '5b990733cef48424966ed0eb',
        'class': {
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        },
        'date': '2018-09-18T16:00:00.000Z',
        'type': 'Class',
        'hours': 4,
        '__v': 0
      },
      {
        '_id': '5b990729cef48424966ed0de',
        'class': {
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        },
        'date': '2018-09-13T16:00:00.000Z',
        'type': 'Cancelled',
        'hours': 0,
        '__v': 0
      },
      {
        '_id': '5b99071dcef48424966ed0d1',
        'class': {
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        },
        'date': '2018-09-12T16:00:00.000Z',
        'type': 'PHoliday',
        'hours': 0,
        '__v': 0
      },
      {
        '_id': '5b99066acef48424966ed081',
        'class': {
          '_id': '5b97b8f2adfb2e018c64d372',
          'className': 'Upstars Class A 2018'
        },
        'date': '2018-09-11T16:00:00.000Z',
        'type': 'Class',
        'hours': 3,
        '__v': 0
      }
    ]
    test('no filters returns all attendance', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/dateStart/dateEnd')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual(foundAttendances)
    })

    test('class filter returns attendance from that class', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/5b97b8f2adfb2e018c64d372/dateStart/dateEnd')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual(foundAttendances)
    })

    test('bad class ID returns null', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/5b97b8f2adfb2e018c64d312/dateStart/dateEnd')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([])
    })

    test('filter returns attendance from non existenent class returns empty', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/5b97bdc5058d1e1e64d232f3/dateStart/dateEnd')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([])
    })

    test('filter returns attendance after selected date', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/dateStart/16092018/dateEnd')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([
        {
          '_id': '5b99073ecef48424966ed0f9',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-25T16:00:00.000Z',
          'type': 'Class',
          'hours': 2,
          '__v': 0
        },
        {
          '_id': '5b990733cef48424966ed0eb',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-18T16:00:00.000Z',
          'type': 'Class',
          'hours': 4,
          '__v': 0
        }
      ])
    })

    test('filter returns attendance before selected date', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/dateStart/dateEnd/16092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([
        {
          '_id': '5b990729cef48424966ed0de',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-13T16:00:00.000Z',
          'type': 'Cancelled',
          'hours': 0,
          '__v': 0
        },
        {
          '_id': '5b99071dcef48424966ed0d1',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-12T16:00:00.000Z',
          'type': 'PHoliday',
          'hours': 0,
          '__v': 0
        },
        {
          '_id': '5b99066acef48424966ed081',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-11T16:00:00.000Z',
          'type': 'Class',
          'hours': 3,
          '__v': 0
        }
      ])
    })

    test('filter returns attendance for both start and end dates', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/dateStart/19092018/dateEnd/26092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([
        {
          '_id': '5b99073ecef48424966ed0f9',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-25T16:00:00.000Z',
          'type': 'Class',
          'hours': 2,
          '__v': 0
        },
        {
          '_id': '5b990733cef48424966ed0eb',
          'class': {
            '_id': '5b97b8f2adfb2e018c64d372',
            'className': 'Upstars Class A 2018'
          },
          'date': '2018-09-18T16:00:00.000Z',
          'type': 'Class',
          'hours': 4,
          '__v': 0
        }
      ])
    })

    test('bad date filter returns attendance as empty', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/class/dateStart/26092018/dateEnd/19092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.foundAttendances).toEqual([])
    })
  })

  describe('get attendance by userId', () => {
    test('all fields are working', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/user/5b912ba72b9ec042a58f88a4/01092018-26092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 5)
      expect(response.body.attendances[0]).toHaveProperty('attended', 2)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 7)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.4)
      expect(response.body.attendances[0].userAttendance).toEqual([
        {
          'status': 0,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 1,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-13T16:00:00.000Z',
          'duration': 0,
          'classType': 'Cancelled',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-12T16:00:00.000Z',
          'duration': 0,
          'classType': 'PHoliday',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 1,
          'date': '2018-09-11T16:00:00.000Z',
          'duration': 3,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('all fields working 2', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/user/5b912ba72b9ec042a58f88a4/19092018-26092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 2)
      expect(response.body.attendances[0]).toHaveProperty('attended', 1)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 4)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.5)
      expect(response.body.attendances[0].userAttendance).toEqual([
        {
          'status': 0,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 1,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('adding class as a perimeter', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/user/5b912ba72b9ec042a58f88a4/19092018-26092018/5b97b8f2adfb2e018c64d372')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 2)
      expect(response.body.attendances[0]).toHaveProperty('attended', 1)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 4)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.5)
      expect(response.body.attendances[0].userAttendance).toEqual([
        {
          'status': 0,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 1,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('non existent class returns empty', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/user/5b912ba72b9ec042a58f88a4/19092018-26092018/5b97bdc5058d1e1e64d232f3')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances).toEqual([])
    })
  })

  describe('get attendance by student ID', () => {
    test('all fields are working', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/student/5b936ce7defc1a592d677008/01092018-26092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 5)
      expect(response.body.attendances[0]).toHaveProperty('attended', 2)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 5)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.4)
      expect(response.body.attendances[0].studentAttendance).toEqual([
        {
          'status': 1,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-13T16:00:00.000Z',
          'duration': 0,
          'classType': 'Cancelled',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-12T16:00:00.000Z',
          'duration': 0,
          'classType': 'PHoliday',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 1,
          'date': '2018-09-11T16:00:00.000Z',
          'duration': 3,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('all fields working 2', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/student/5b936ce7defc1a592d677008/19092018-26092018')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 2)
      expect(response.body.attendances[0]).toHaveProperty('attended', 1)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 2)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.5)
      expect(response.body.attendances[0].studentAttendance).toEqual([
        {
          'status': 1,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('adding class as a perimeter', async () => {
      expect.assertions(6)
      const response = await app.get('/attendance/student/5b936ce7defc1a592d677008/19092018-26092018/5b97b8f2adfb2e018c64d372')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances[0]).toHaveProperty('total', 2)
      expect(response.body.attendances[0]).toHaveProperty('attended', 1)
      expect(response.body.attendances[0]).toHaveProperty('totalHours', 2)
      expect(response.body.attendances[0]).toHaveProperty('percentage', 0.5)
      expect(response.body.attendances[0].studentAttendance).toEqual([
        {
          'status': 1,
          'date': '2018-09-25T16:00:00.000Z',
          'duration': 2,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        },
        {
          'status': 0,
          'date': '2018-09-18T16:00:00.000Z',
          'duration': 4,
          'classType': 'Class',
          'className': [
            'Upstars Class A 2018'
          ],
          'classId': [
            '5b97b8f2adfb2e018c64d372'
          ]
        }
      ])
    })

    test('non existent class returns empty', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/student/5b936ce7defc1a592d677008/19092018-26092018/5b97bdc5058d1e1e64d232f3')
      expect(response.statusCode).toBe(200)
      expect(response.body.attendances).toEqual([])
    })
  })

  describe('get a single class attendance summary', () => {
    test('bad classId throws errors', async () => {
      expect.assertions(2)
      const response = await app.get('/attendance/5b97b8f2adfb2e018c64d3/summary')
      expect(response.statusCode).toBe(500)
      expect(response.body).toEqual({ 'error': 'The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That\'s all we know.' })
    })

    test('non-existent class returns empty array', async () => {
      expect.assertions(7)
      const response = await app.get('/attendance/5b97b8f2adfb2e018c64d377/summary')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('studentNumber', 0)
      expect(response.body).toHaveProperty('tutorNumber', 0)
      expect(response.body).toHaveProperty('studentTutorRatio', 0)
      expect(response.body.compiledStudentAttendance).toEqual([])
      expect(response.body.compiledUserAttendance).toEqual([])
      expect(response.body.attendanceDates).toEqual([])
    })

    test('active class returns sorted information', async () => {
      expect.assertions(7)
      const response = await app.get('/attendance/5b97b8f2adfb2e018c64d372/summary')
      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('studentNumber', 1)
      expect(response.body).toHaveProperty('tutorNumber', 1)
      expect(response.body).toHaveProperty('studentTutorRatio', 1)
      expect(response.body.compiledStudentAttendance).toEqual([
        {
          'studentID': '5b936ce7defc1a592d677008',
          'studentName': [
            'Lingxin  Long'
          ],
          'total': 3,
          'attended': 2,
          'percentage': 0.6666666666666666,
          'details': [
            1,
            0,
            0,
            0,
            1
          ]
        }
      ])
      expect(response.body.compiledUserAttendance).toEqual([
        {
          'userID': '5b912ba72b9ec042a58f88a4',
          'userName': [
            'Wuying Kong'
          ],
          'total': 3,
          'attended': 2,
          'percentage': 0.6666666666666666,
          'details': [
            1,
            0,
            0,
            1,
            0
          ]
        }
      ])
      expect(response.body.attendanceDates).toEqual([
        {
          '_id': '5b99066acef48424966ed081',
          'date': '2018-09-11T16:00:00.000Z',
          'type': 'Class'
        },
        {
          '_id': '5b99071dcef48424966ed0d1',
          'date': '2018-09-12T16:00:00.000Z',
          'type': 'PHoliday'
        },
        {
          '_id': '5b990729cef48424966ed0de',
          'date': '2018-09-13T16:00:00.000Z',
          'type': 'Cancelled'
        },
        {
          '_id': '5b990733cef48424966ed0eb',
          'date': '2018-09-18T16:00:00.000Z',
          'type': 'Class'
        },
        {
          '_id': '5b99073ecef48424966ed0f9',
          'date': '2018-09-25T16:00:00.000Z',
          'type': 'Class'
        }
      ])
    })
  })

  describe('get summary for all classes', () => {
    test('no fields needed', async () => {
      // This example shows that classes that are just created and does not have any single attendance record
      // Will simply be ignored in the summary. That is a limitation of this function.
      expect.assertions()
      const response = await app.get('/attendance/summary/all')
      expect(response.statusCode).toBe(200)
      expect(response.body.editedActiveClass).toEqual([
        {
          'userNumber': 1,
          'studentNumber': 2,
          'className': 'Upstars Class A 2018',
          'dayAndTime': 'Wednesday, 3pm',
          'id': '5b97b8f2adfb2e018c64d372',
          'STRatio': 2,
          'usersPercentage': 0.6666666666666666,
          'studentsPercentage': 0.6666666666666666
        },
        {
          'userNumber': 0,
          'studentNumber': 0,
          'className': 'Upstars Class B',
          'dayAndTime': 'Friday 9PM',
          'id': expect.any(String),
          'STRatio': 0,
          'usersPercentage': 0,
          'studentsPercentage': 0
        }
      ])
    })
  })

  describe('add attendance for a class', () => {
    const attendanceDetails = {
      // 'date': '2018-12-17T16:00:00.000Z',
      'hours': 5,
      // 'classId': '5b97b8f2adfb2e018c64d372',
      'users': [{
        'user': '5b912ba72b9ec042a58f88a4',
        'status': 1
      }],
      'students': [{
        'student': '5b936ce7defc1a592d677008',
        'status': 1
      }],
      'type': 'Class'
    }

    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/attendance').set('x-access-token', userToken)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('no classId throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/attendance')
        .set('x-access-token', userToken)
        .send(attendanceDetails)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a classId' })
    })

    test('missing fields throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/attendance')
        .set('x-access-token', userToken)
        .send({
          ...attendanceDetails,
          classId: '5b97b8f2adfb2e018c64d372'
        })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'There is something wrong with the client input. That is all we know.' })
    })

    test('no privilege throws error', async () => {
      expect.assertions(2)
      const response = await app.post('/attendance')
        .set('x-access-token', lowPrivUserToken)
        .send({
          ...attendanceDetails,
          classId: '5b97b8f2adfb2e018c64d372'
        })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your client does not have the permissions to access this function.' })
    })

    test('all fields present returns success', async () => {
      expect.assertions(2)
      const response = await app.post('/attendance')
        .set('x-access-token', userToken)
        .send({
          ...attendanceDetails,
          classId: '5b97b8f2adfb2e018c64d372',
          date: '2018-10-17T16:00:00.000Z'
        })
      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('attendanceId')
    })

    test('editing an attendance works', async () => {
      expect.assertions(3)
      const response = await app.post('/attendance')
        .set('x-access-token', userToken)
        .send({
          ...attendanceDetails,
          hours: 2,
          classId: '5b97b8f2adfb2e018c64d372',
          date: '2018-10-17T16:00:00.000Z'
        })
      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('attendanceId')

      const attendanceData = await app.get(`/attendance/${response.body.attendanceId}`)
      expect(attendanceData.body.attendances.hours).toBe(2)
    })
  })

  describe('deleting attendance', () => {
    test('no fields throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/attendance').set('x-access-token', userToken)
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an existing attendanceId' })
    })

    test('no attendanceId throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/attendance')
        .set('x-access-token', userToken)
        .send({
          classId: '5b97b8f2adfb2e018c64d372'
        })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an existing attendanceId' })
    })

    test('no classId throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/attendance')
        .set('x-access-token', userToken)
        .send({
          // classId: '5b97b8f2adfb2e018c64d372'
          attendanceId: '5b990729cef48424966ed0de'
        })
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide an existing classId' })
    })

    test('insufficient privilege throws error', async () => {
      expect.assertions(2)
      const response = await app.delete('/attendance')
        .set('x-access-token', lowPrivUserToken)
        .send({
          classId: '5b97b8f2adfb2e018c64d372',
          attendanceId: '5b990729cef48424966ed0de'
        })
      expect(response.statusCode).toBe(403)
      expect(response.body).toEqual({ 'error': 'Your client does not have the permissions to access this function.' })
    })

    test('proper token returns success', async () => {
      expect.assertions(2)
      const response = await app.delete('/attendance')
        .set('x-access-token', userToken)
        .send({
          classId: '5b97b8f2adfb2e018c64d372',
          attendanceId: '5b990729cef48424966ed0de'
        })
      expect(response.statusCode).toBe(200)

      const attendanceData = await app.get('/attendance/5b990729cef48424966ed0de')
      expect(attendanceData.body.attendances).toBe(null)
    })
  })
})

describe('testing stats and misc related APIs', () => {
  test('stats should be working', async () => {
    expect.assertions(8)
    const response = await app.get('/stats/dashboard')
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('totalUserEstimate', 9)
    expect(response.body).toHaveProperty('newUserJoined', 2)
    expect(response.body).toHaveProperty('totalClassesEstimate', 3)
    expect(response.body).toHaveProperty('totalClassesHeldEstimate', 5)
    expect(response.body).toHaveProperty('newClassesHeld', 0)
    expect(response.body).toHaveProperty('totalStudentEstimate', 5)
    expect(response.body).toHaveProperty('newStudentJoined', 2)
  })

  describe('cloning a new class', () => {
    test('bad classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/clone/123')
      expect(response.statusCode).toBe(400)
      expect(response.body).toEqual({ 'error': 'Please provide a proper classId' })
    })

    test('non-existent classId throws error', async () => {
      expect.assertions(2)
      const response = await app.get('/class/clone/5b97b8f2adfb2e018c64d123')
      expect(response.statusCode).toBe(404)
      expect(response.body).toEqual({ 'error': 'Class not found, please try again' })
    })

    test('proper classId returns success', async () => {
      expect.assertions(2)
      const response = await app.get('/class/clone/5b97bdc5058d1e1e64d232f3')
      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty('newClassId', expect.any(String))
    })
  })
})
