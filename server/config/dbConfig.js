var Datastore = require('nedb');

module.exports.dbClass = new Datastore({
    filename: './server/databases/classes.db', // provide a path to the database file 
    autoload: true, // automatically load the database
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
});

module.exports.dbUser = new Datastore({
    filename: './server/databases/user.db',
    autoload: true,
    timestampData: true
})


