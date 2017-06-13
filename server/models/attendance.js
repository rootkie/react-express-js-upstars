const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// Attendance Schema
// ================================
const AttendanceSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  hours: {
    type: Number,
    default: 0,
    required: true
  },
  class: {
    type: Schema.ObjectId,
      ref: 'Class',
      required: true
  },
  users: [{
    list: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    status: {
      type: Number
    },
    _id: false
  }],
  students: [{
    list: {
      type: Schema.ObjectId,
      ref: 'Student'
    },
    status: {
      type: Number
    },
    _id: false
  }],
  type: {
    type: String,
    enum: ['Class', 'PHoliday', 'Cancelled'],
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Attendance', AttendanceSchema)
