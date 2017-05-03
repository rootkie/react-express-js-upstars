## React-Express-upstars
This project is to build a student volunteer content management system using react.js as front-end and express.js as backend for the beneficiary upstars.

## Overview
This system is built using express.js as an API provider. The APIs are consumed by react.js to display. The datbase used is nedb.

## Documentation
### Start running
Start server using: nodemon server/


### Directory

|Directory        |    Uses   |
|------------|---------------------|
|/src               |React.js stuff   |
|/server            |Express.js stuff |
|/server/controllers|All the application logic |
|/server/models     |Schemas and database operations |


## API stuff

All routes starting with /api and /api/admin is handled by express.js.  
/api is accessible to all  
/api/admin is accessible to authenticated user only  


|method|path|uses|
|------|----|----|
|GET| /api/admin/getClasses | Get all classes from database|
|GET| /api/admin/getClass/:id | Get class by id|
|POST| /api/admin/addClass | Add class ({classname:'example',description:'example',students:'a,b,c'}) students are separated by ","|
|POST| /api/register | Create a user ({password:'a',email:'a@a.com',firstName:'a',lastName:'a'}) cannot be null.|
|POST| /api/login | Login as user ({email:'a@a.com',password:'a'}) Will return a jwt token if authed. Use the token to access /api/admin|


## Troubleshoot
```
bash: nodemon: command not found
Try using:
$ ./node_modules/.bin/nodemon server/
Or use:
$ export PATH=$PATH:`pwd`/node_modules/.bin/
$ nodemon server/
```

