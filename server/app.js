const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const path = require('path')
const routeMiddlware = require('./routeMiddleware')
const app = express()

const mongoose = require('mongoose')
const config = require('./config/constConfig')

// ===================Initialization ==============================

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))
// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')))
// Enable Cross Origin Resource Sharing
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

// Connecting to database
mongoose.Promise = global.Promise
mongoose.connect(config.database)

// Body parser stuff
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

routeMiddlware.setAdminRouteMiddleware(app)

// ==================End of Initialization=========================

// ==============Serving api======================
// only takes in x-www-form-urlencoded in req
const classControl = require('./controllers/ClassController')
const userControl = require('./controllers/UserController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')

if (config.debug) {
  app.get('/api/getClasses', classControl.getAll)
  app.get('/api/getClass/:id', classControl.getClassById)
  app.post('/api/addEditClass', classControl.addEditClass)

// POC for refs
  app.post('/api/addStudentToClass', classControl.addStudentToClass)
  app.post('/api/deleteStudentFromClass', classControl.deleteStudentFromClass)

  app.get('/api/getStudents', studentControl.getAll)
  app.get('/api/getStudent/:id', studentControl.getStudentById)
  app.post('/api/addStudent', studentControl.addStudent)

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)

// ===========for testing purposes only===============
  app.delete('/api/admin/clear-database', classControl.dropDB)

// ===========for testing purposes only===============
} else {
  app.get('/api/admin/getClasses', classControl.getAll)
  app.get('/api/admin/getClass/:id', classControl.getClassById)
  app.post('/api/admin/addEditClass', classControl.addEditClass)

// POC for refs
  app.get('/api/admin/addStudentToClass', classControl.addStudentToClass)

  app.get('/api/admin/getStudents', studentControl.getAll)
  app.get('/api/admin/getStudent/:id', studentControl.getStudentById)
  app.post('/api/admin/addStudent', studentControl.addStudent)

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)

// ===========for testing purposes only===============
  app.delete('/api/admin/clear-database', classControl.dropDB)

// ===========for testing purposes only===============
}
// ==================End of API ====================

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

module.exports = app
