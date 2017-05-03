const bcrypt = require('bcrypt-nodejs');;
const config = require('../config/constConfig');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User  = require('../models/user');

function generateToken(user){
  return jwt.sign(user,config.secret,{
    expiresIn: 3600 // 1 hour
  });
}


function makeUser(req){
  return {
    _id:req._id,
    firstName: req.profile.firstName,
    lastName: req.profile.lastName,
    email: req.email,
    role: req.role,
  }
}

module.exports.login = function(req,res){
  const password = req.body.password;
  User.findOne({ email:req.body.email }, (err,user)=>{
    if(err) return res.status(500).send('server error');
    if(!user) return res.status(403).send('Wrong email or password');

    user.comparePassword(password, function(err, isMatch) {
      if(err) return res.status(500).send('server error');
      if (!isMatch) return res.status(403).send('Wrong email or password');

      let userInfo = makeUser(user);
      res.json({
        token:generateToken(userInfo),
        user:userInfo,
        status:'success'
      }); //res.json
    });//compare pwd
  });//finding user
}

module.exports.register = function (req,res){
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const password = req.body.password;
  // Return error if no email provided
  if (!email) {
    return res.status(422).send({ error: 'You must enter an email address.'});
  }

  // Return error if full name not provided
  if (!firstName || !lastName) {
    return res.status(422).send({ error: 'You must enter your full name.'});
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: 'You must enter a password.' });
  }


  User.findOne({email:email},function(err,exisitingUser){
    if(err){ 
      return res.status(500).send({ error:'db something wrong' })
    }
    if(exisitingUser) {
      return res.status(422).send({ error:'This email is already in use'})
    }
    //no errors, create new user
    let user= new User ({
      email:email,
      profile: {
        firstName:firstName,
        lastName:lastName,
      },
      password:password
    });

    user.save(function(err,user){
      if (err){
        return res.status(500).send({ error:'db something wrong'})
      }
      //generate tokens    
      let userInfo = makeUser(user);
      res.json({
        token:generateToken(userInfo),
        user:userInfo,
        status:'success'
      });

    });

  });
}