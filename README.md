## React-Express-upstars
This project is to build a student volunteer content management system using react.js as front-end and express.js as backend for the beneficiary UPStars.

## Overview
This system is built using express.js as an API provider. The APIs are consumed by react.js to display. The database used is [MongoDB](https://www.mongodb.com/).

## Documentation
### Getting Started
1. Install Node v8.9.x
2. `npm install`
3. [Install MongoDB](https://docs.mongodb.com/manual/administration/install-community/)

### Start running
Type these commands into the shell:

1. `mongod --bind_ip=$IP`
2. `nodemon server/`

### Basic Guide
Proceed to [here](GUIDE.md) for a guide on backend development


### Directory

|Directory        |    Uses   |
|------------|---------------------|
|/src               |React.js stuff   |
|/server            |Express.js stuff |
|/server/controllers|All the application backend logic |
|/server/models     |Schemas and database operations |


## Resources

All API documentation is in the [wiki](https://github.com/rootkie/react-express-js-upstars/wiki).

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
* Review the [documentation](https://github.com/rootkie/react-express-js-upstars/wiki) and make pull requests for anything from typos to new content
* [Join us in developing upcoming features or tackling bugs and issues](https://github.com/rootkie/react-express-js-upstars/projects)

## Licence

Copyright &copy; R3:C0D3 | Ulu Pandan Stars. All rights reserved.

