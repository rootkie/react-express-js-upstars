const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// User Schema
// ================================
const ClassSchema = new Schema({
  className: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String
  },
  students: {
    type: [String]
  }

},
  {
    timestamps: true
  })

module.exports = mongoose.model('Class', ClassSchema)
