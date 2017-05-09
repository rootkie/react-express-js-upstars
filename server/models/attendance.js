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
  hours: Number,
  class: { type: Schema.ObjectId, ref: 'Class' },
  tutors: [{ type: Schema.ObjectId, ref: 'User' }],
  students: [{ type: Schema.ObjectId, ref: 'Student' }],

},
  {
    timestamps: true
  })

module.exports = mongoose.model('Attendance', AttendanceSchema)
