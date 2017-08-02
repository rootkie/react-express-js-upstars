const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const filter = require('content-filter')
const path = require('path')
const app = express()
const mongoose = require('mongoose')
const config = require('./config/constConfig')
const filterOptions = {
  urlBlackList: ['$', '%7B', '&&', '||', '.', '$ne', '$where', 'eval'], //ASCII code: %7B = { due to urlencoding
  urlMessage: 'A forbidden expression has been found in URL',
  bodyBlackList: ['$', '{', '&&', '||', '$ne', '$where', 'eval'],
  bodyMessage: 'A forbidden expression has been found in form data',
  methodList: ['POST', 'PUT', 'DELETE', 'GET'],
  dispatchToErrorHandler: false,
}

// ===================Initialization ==============================

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))
  // Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')))
  // Enable Cross Origin Resource Sharing
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, x-access-token')
  res.header('Access-Control-Expose-Headers', 'x-access-token')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

// Connecting to database
mongoose.Promise = global.Promise
mongoose.connect(config.database)
  /* Production & for Mongoose 4.11.0 and above
  mongoose.openUri(config.database, {
  useMongoClient: true,
  ssl: true
  })
  */
mongoose.set('debug', true);

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// Body parser stuff
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.use(filter(filterOptions))

require('./Routes')(app)

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send({
    error: "The server encountered an error and could not proceed and complete your request. If the problem persists, please contact our system administrator. That's all we know."
  })
})

// ==================End of Initialization=========================

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'))
})

module.exports = app
