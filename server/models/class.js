const mongoose = require('mongoose')
const Schema = mongoose.Schema
// ================================
// Class Student Schema
// ================================
const ClassSchema = new Schema({
  // Class information
  className: {
    type: String,
    required: true,
    index: true
  },
  classType: {
    type: String,
    enum: ['Tuition', 'Enrichment'],
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  dayAndTime: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  // Refs to other models
  students: [{
    type: Schema.ObjectId,
    ref: 'Student'
  }],
  users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    default: 'Active',
    required: true
  }

}, {
  timestamps: true,
  minimize: false
})

ClassSchema.pre('save', function (next) {
  this.increment()
  return next()
})

ClassSchema.pre('updateMany', function (next) {
  this.updateMany({ $inc: { __v: 1 } })
  next()
})

module.exports = mongoose.model('Class', ClassSchema)
