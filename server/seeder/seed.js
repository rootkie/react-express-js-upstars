var db = require('../config/dbConfig').db

module.exports.seedClass = function(){
    let class1 = {
        classname: 'C4C',
        description: 'We code',
    };

    // Save this goal to the database.
    db.count({},(err,count)=>{
        if (count < 2){
            db.insert(class1, function(err, newClass) {
                if (err) console.log(err);
                console.log(newClass);
            });    
        }
    })
};

module.exports.seedUser = function(){
    let user = {
        username: 'admin',
        password: 'admin',
        email: 'admin@email.com',
    };
    db.insert(user,function(err,newUser){
        if (err) console.log(err);
        console.log(newUser);
    });
};