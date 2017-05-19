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
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

routeMiddlware.setAdminRouteMiddleware(app)

require('./Routes')(app)
// ==================End of Initialization=========================

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

module.exports = app
