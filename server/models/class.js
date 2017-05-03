const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//================================
// User Schema
//================================
const ClassSchema = new Schema({  
  className: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
  },
 
},
{
  timestamps: true
});

module.exports = mongoose.model('Class', ClassSchema); 