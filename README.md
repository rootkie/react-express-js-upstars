## React-Express-upstars
This project is to build a student volunteer content management system using react.js as front-end and express.js as backend for the beneficiary upstars.

## Overview
This system is built using express.js as an API provider. The APIs are consumed by react.js to display. The database used is [MongoDB](https://www.mongodb.com/).

## Documentation
### Getting Started
1. Install Node v7.x.x
2. `npm install`
3. [Install MongoDB](https://docs.mongodb.com/manual/administration/install-community/)

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

### Quick API Reference

* [Attendance](https://github.com/rootkie/react-express-js-upstars/blob/master/docs/slate/source/includes/_attendance.md)
* [Classes](https://github.com/rootkie/react-express-js-upstars/blob/master/docs/slate/source/includes/_classes.md)
* [Errors](https://github.com/rootkie/react-express-js-upstars/blob/master/docs/slate/source/includes/_errors.md)
* [Students](https://github.com/rootkie/react-express-js-upstars/blob/master/docs/slate/source/includes/_students.md)

## Troubleshoot
```
bash: nodemon: command not found
Try using:
$ ./node_modules/.bin/nodemon server/
Or use:
$ export PATH=$PATH:`pwd`/node_modules/.bin/
$ nodemon server/
```

## Contributing

This repository is where we do development and there are many ways you can participate in the project, for example:

* [Submit bugs and feature requests](https://github.com/rootkie/react-express-js-upstars/issues)
* [Review source code changes](https://github.com/rootkie/react-express-js-upstars/pulls)
* Review the documentation and make pull requests for anything from typos to new content

## Licence

Copyright &copy; r3:c0d3 | Ulu Pandan Stars. All rights reserved.

