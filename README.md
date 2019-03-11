## React-Express-upstars
![UPStars](src/components/Misc/logo.png "UPStars Project")

This project is to build a student volunteer content management system using react.js as front-end and express.js as backend for the beneficiary UPStars.

## Overview
This system is built using express.js as an API provider. The APIs are consumed by react.js to display. The database used is [MongoDB](https://www.mongodb.com/).

## Documentation
### Getting Started
1. Install Node >= v8.9.x
2. `npm install`
3. [Install MongoDB (v3.4 only)](https://docs.mongodb.com/manual/administration/install-community/)

### Start running
Type these commands into the shell:

1. `mongod`
2. `nodemon server/`
3. `npm start`

### Directory

|Directory        |    Uses   |
|------------|---------------------|
|/src               |React.js stuff   |
|/server            |Express.js stuff |
|/server/controllers|All the application backend logic |
|/server/models     |Schemas and database operations |
|/dump              |A mongoDB template pre-created for testing purposes |


## Resources

All API documentation is in the [wiki](https://github.com/rootkie/react-express-js-upstars/wiki).

## Testing

All tests could be ran manually by following the steps in the [testing guide](https://github.com/rootkie/react-express-js-upstars/wiki/Testing-Guide)

## Troubleshoot
```
bash: nodemon: command not found
Try using:
$ ./node_modules/.bin/nodemon server/
Or use:
$ export PATH=$PATH:`pwd`/node_modules/.bin/
$ nodemon server/
Or finally install nodemon as a global package:
$ npm i nodemon -g
```

## Contributing

This repository is where we do development and there are many ways you can participate in the project, for example:

* [Submit bugs and feature requests](https://github.com/rootkie/react-express-js-upstars/issues)
* [Review source code changes](https://github.com/rootkie/react-express-js-upstars/pulls)
* Review the [documentation](https://github.com/rootkie/react-express-js-upstars/wiki) and make pull requests for anything from typos to new content
* [Join us in developing upcoming features or tackling bugs and issues](https://github.com/rootkie/react-express-js-upstars/projects)

## Licence

Copyright &copy; R3:C0D3 | Ulu Pandan Stars. All rights reserved.

Currently we do not have a plan to appoint any open-source licence at the moment. However, you are still free to use the code to
develop and contribute freely as long as the code is public. 

