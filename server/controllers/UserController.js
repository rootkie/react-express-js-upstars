const bcrypt = require('bcrypt-nodejs');
const db = require('../config/dbConfig').dbUser
const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

//=================== internal functions ==================
function hashing(text){
    bcrypt.genSaltSync(5)
    var hash = bcrypt.hashSync(text);
    return hash;
}

function createUser(username,password,email){
    if (!username || !password || !email) return null;
    let user = {
        username:username,
        password:hashing(password),
        email:email,
    }
    return user;
}

function generateToken(user){
    return jwt.sign(user,config.secret,{
        expiresIn: 3600 // one hour
    })
}

//====================end of internal functions ============


//====================exports ==================
module.exports.register = function(req,res){
    // ensures the fields are unique
    db.ensureIndex( { fieldName:'email', unique:true }, (err)=>{
        console.log(err);
    })
    db.ensureIndex( { fieldName:'username', unique:true }, (err)=>{
        console.log(err)
    })

    //Creating user
    var user = createUser(req.body.username,req.body.password,req.body.email)
    if (!user) return res.status(500).send('Some fields are empty');

    db.insert(user, function(err, newUser) {
        if (err){ 
            console.log(err);
            return res.status(500).send('Database controller errors '+ err.key+' has been used')
        } else {
            console.log(newUser);
            res.json({status:"success"});    
        }
    });
}

module.exports.login = function (req,res){
    db.findOne({ email:req.body.email }, (err,user)=>{
        if (user){
            //user creds check
            if (bcrypt.compareSync(req.body.password,user.password)){
                let tokenUser = {
                    username:user.username,
                    email:user.email,
                    id:user._id,
                }
                console.log(tokenUser);
                let token = generateToken(tokenUser)
                
                res.json({
                    status:'success',
                    token:token,
                })
                
            } else {
                //wrong password
                res.status(403).json({status:'Failed login'});
            }

        } else {
            //no such user
            res.status(403).json({status:'Failed login'});
        }
    })
}

module.exports.dropDB = function(req,res){
    db.remove({},{ multi:true },(err,num)=>{
        if (err) res.status(500).send(err);
        res.json({removed:num});
    });
}

//==================end of exports =============