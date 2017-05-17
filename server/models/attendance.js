const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// Attendance Schema
// ================================
const AttendanceSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  hours: {
    type: Number,
    default: 0
  },
  class: { type: Schema.ObjectId, ref: 'Class' },
  users: [{ type: Schema.ObjectId, ref: 'User' }],
  students: [{ type: Schema.ObjectId, ref: 'Student' }],
  type: {
    type: String,
    enum: ['Class', 'PHoliday', 'Cancelled']
  }
},
  {
    timestamps: true
  })

module.exports = mongoose.model('Attendance', AttendanceSchema)
