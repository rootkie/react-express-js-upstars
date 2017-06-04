const mongoose = require('mongoose')
const Schema = mongoose.Schema
// ================================
// Class Student Schema
// ================================
const ClassSchema = new Schema({
  className: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String
  },
  students: [{
    type: Schema.ObjectId,
    ref: 'Student'
  }],
  users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  externalPersonnel: {
    type: String
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Class', ClassSchema)
