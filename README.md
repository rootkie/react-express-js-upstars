## React-Express-upstars
This project is to build a student volunteer content management system using react.js as front-end and express.js as backend for the beneficiary upstars.

## Overview
This system is built using express.js as an API provider. The APIs are consumed by react.js to display. The datbase used is nedb.

## Documentation
### Getting Started
1. Install Node v7.x.x
2. `npm install`

### Start running
Start server using: nodemon server/


### Directory

|Directory        |    Uses   |
|------------|---------------------|
|/src               |React.js stuff   |
|/server            |Express.js stuff |
|/server/controllers|All the application logic |
|/server/models     |Schemas and database operations |
|/docs/slate        |The documentation folder |


## API stuff

All API documentation is in /docs/slate/ folder
```
$ cd docs/slate/
$ bundle install
$ bundle exec middleman server
```


## Troubleshoot
```
bash: nodemon: command not found
Try using:
$ ./node_modules/.bin/nodemon server/
Or use:
$ export PATH=$PATH:`pwd`/node_modules/.bin/
$ nodemon server/
```

