const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const path = require('path')
const app = express()
const mongoose = require('mongoose')

// ===================Initialization ==============================

// New in 0.3.1-beta to replace constConfig.js
require('dotenv').config()
// Allow express to log using remote IP Address
app.set('trust proxy', true)
// Setup logger
app.use(morgan(':remote-addr [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))

app.use(helmet())

// Enable Cross Origin Resource Sharing
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN)
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-access-token')
  res.header('Cache-Control', 'no-cache')
  next()
})

mongoose.set('debug', true)
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

// Connecting to database
mongoose.Promise = global.Promise
if (process.env.NODE_ENV === 'production') {
  mongoose.connect(process.env.DATABASE)
} else {
  mongoose.connect(process.env.DATABASE_DEBUG)
}
/* Production & for Mongoose 4.11.0 and above && for MongoDB 3.6+
  mongoose.openUri(process.env.DATABASE, {
  useMongoClient: true,
  ssl: true
  })
  */

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

// Body parser stuff
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(mongoSanitize({
  replaceWith: new String('')
}))

require('./Routes')(app)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send({
    error: "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know."
  })
})

// ==================End of Initialization=========================
// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')))
// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

module.exports = app
