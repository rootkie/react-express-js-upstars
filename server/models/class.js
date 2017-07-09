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
    enum: ['Tuition','Enrichment'],
    require: true
  },
  venue: {
    type: String,
    require: true
  },
  dayAndTime: {
    type: String,
    require: true
  },
  startDate: {
    type: Date,
    require: true
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
  }]

}, {
  timestamps: true,
  minimize: false
})

module.exports = mongoose.model('Class', ClassSchema)
