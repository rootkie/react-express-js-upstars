const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// Student Schema
// ================================
const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  icNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },

  dob: {
    type: Date,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  gender: {
    type: String,
    required: true,
    enum: ['M', 'F']
  },

  nationality: {
    type: String,
    required: true
  },

  classLevel: {
    type: String,
    required: true
  },

  schoolName: {
    type: String,
    required: true
  },

  fatherName: {
    type: String
  },
  fatherIcNumber: {
    type: String,
    trim: true
  },
  fatherNationality: {
    type: String
  },
  fatherContactNumber: {
    type: String
  },
  fatherEmail: {
    type: String,
    trim: true
  },
  fatherOccupation: {
    type: String
  },
  fatherIncome: {
    type: String
  },

  motherName: {
    type: String
  },
  motherIcNumber: {
    type: String
  },
  motherNationality: {
    type: String
  },
  motherContactNumber: {
    type: String
  },
  motherEmail: {
    type: String,
    trim: true
  },
  motherOccupation: {
    type: String
  },
  motherIncome: {
    type: String
  },

  otherFamily: [{
    _id: false,
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    }
  }],

  fas: [{
    type: String,
    enum: ['MOE', 'Mendaki', 'Others', 'FSC', 'None'],
    default: ['None']
  }],

  fsc: {
    type: String
  },

  tuition: [{
    type: String,
    enum: ['CDAC', 'Mendaki', 'Private', 'None'],
    default: ['None']
  }],

  academicInfo: [{
    _id: false,
    year: {
      type: Number,
      required: true
    },
    term: {
      type: Number,
      required: true
    },
    english: {
      type: Number,
      required: true
    },
    math: {
      type: Number,
      required: true
    },
    motherTongue: {
      type: Number,
      required: true
    },
    science: {
      type: Number,
      required: true
    },
    overall: {
      type: Number,
      required: true
    }
  }],

  classes: [{
    type: Schema.ObjectId,
    ref: 'Class'
  }],

  admin: {
    interviewDate: {
      type: Date
    },
    interviewNotes: {
      type: String
    },
    commencementDate: {
      type: Date
    },
    adminNotes: {
      type: String
    },
    exitDate: {
      type: Date
    },
    exitReason: {
      type: String
    }
  },

  status: {
    type: String,
    default: 'Active',
    required: true
  }

}, {
  timestamps: true,
  minimize: false
})

StudentSchema.pre('save', function (next) {
  this.increment()
  return next()
})

StudentSchema.pre('updateMany', function (next) {
  this.updateMany({ $inc: { __v: 1 } })
  next()
})

module.exports = mongoose.model('Student', StudentSchema)
