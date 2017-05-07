const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Class = require('./class')

// ================================
// User Schema
// ================================
const StudentSchema = new Schema({
  profile: {
    name: {
      type: String,
      unique: true,
      required: true
    },
    icNumber: String,
    email: String,
    contactNumber: Number,
    dateOfBirth: String,
    address: String,
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      default: 'Male'
    }
  },
  schoolType: {
    type: String,
    enum: ['Primary', 'Secondary'],
    default: 'Primary'
  },
  schoolName: String,
  classes: [{ type: Schema.ObjectId, ref: 'Class' }]
},
  {
    timestamps: true
  })

module.exports = mongoose.model('Student', StudentSchema)
