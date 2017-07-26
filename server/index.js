'use strict'

// Replace the commented code with the old code to test HTTPS
/*
const https = require('https')
const http = require('http')

const options = {
    
    key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
    cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
    pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
    passphrase: 'sample'
}
http.createServer(app).listen(PORT); // Keep this if you want express to run in BOTH http and HTTPS in different PORTs
https.createServer(options, app).listen(443); //Remove options if the cert is not ready.

*/

const app = require('./app')

const PORT = process.env.PORT || 3000

// Comment the bottom part if you are using the https.createServer function instead of app.listen
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
})
