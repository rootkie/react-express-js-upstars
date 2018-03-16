const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ExternalSchema = new Schema({
  classId: [{
    type: Schema.ObjectId,
    ref: 'Class'
  }],

  name: {
    type: String,
    required: true
  },

  nric: {
    type: String,
    required: true,
    unique: true
  },

  organisation: {
    type: String
  },

  relationTo: {
    type: String,
    enum: ['Student', 'Volunteer']
  },

  nameOfRelatedPersonnel: {
    type: String
  },

  status: {
    type: String,
    default: 'Active',
    required: true
  }
},
  {
    timestamps: true,
    minimize: false
  })

module.exports = mongoose.model('External', ExternalSchema)
