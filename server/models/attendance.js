const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// Attendance Schema
// ================================

const AttendanceSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    min: 0,
    required: true
  },
  class: {
    type: Schema.ObjectId,
    ref: 'Class',
    required: true
  },
  users: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: Number,
      required: true
    },
    _id: false
  }],
  students: [{
    student: {
      type: Schema.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: Number,
      required: true
    },
    _id: false
  }],
  type: {
    type: String,
    enum: ['Class', 'PHoliday', 'Cancelled'],
    required: true
  }
},
{
  timestamps: true,
  minimize: false
})

AttendanceSchema.pre('save', function (next) {
  this.increment()
  return next()
})

AttendanceSchema.pre('updateMany', function (next) {
  this.updateMany({ $inc: { __v: 1 } })
  next()
})

module.exports = mongoose.model('Attendance', AttendanceSchema)
