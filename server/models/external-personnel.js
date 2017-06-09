const mongoose = require('mongoose')
const Schema = mongoose.Schema
// ================================
// External-personnel Schema
// ================================
const ExternalSchema = new Schema({
  classId: [{
    type: Schema.ObjectId,
    ref: 'Class'
  }],
  name: {
      type: String,
      required: true,
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
  }
},
  {
    timestamps: true
  })

module.exports = mongoose.model('External', ExternalSchema)
