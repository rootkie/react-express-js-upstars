const mongoose = require('mongoose')
const Schema = mongoose.Schema
// ================================
// Class Student Schema
// ================================
const ClassSchema = new Schema({
  // Class information
  className: {
    type: String,
    required: true
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
  externalPersonnel: [{
    type: Schema.ObjectId,
    ref: 'External'
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

module.exports = mongoose.model('Class', ClassSchema)
