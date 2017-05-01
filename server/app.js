const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser')
const path = require('path');
const routeMiddlware = require('./routeMiddleware');

const app = express();


//===================Initialization ==============================
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

routeMiddlware.setAdminRouteMiddleware(app);

//==================End of Initialization=========================

//==============Serving api======================
//only takes in x-www-form-urlencoded in req
var classControl = require('./controllers/ClassController');
var userControl = require('./controllers/UserController');

app.get('/api/admin/getClasses', classControl.getAll);
app.get('/api/admin/getClass/:id',classControl.getClassById);

app.post('/api/admin/addClass',classControl.insert);

app.post('/api/register',userControl.register);
app.post('/api/login',userControl.login);

//===========for testing purposes only===============
app.delete('/api/admin/clear-database',classControl.dropDB);

//===========for testing purposes only===============


//==================End of API ====================




















// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});


module.exports = app;