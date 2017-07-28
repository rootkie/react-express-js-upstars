const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// Student Schema
// ================================
const StudentSchema = new Schema({
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },

    icNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },

    contactNumber: {
      type: Number,
      required: true
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
      enum: ['M', 'F'],
    },

    nationality: {
      type: String,
      required: true
    },

    schoolType: {
      type: String,
      enum: ['Primary', 'Secondary'],
      default: 'Primary'
    },

    schoolName: {
      type: String,
      required: true
    }
  },

  father: {
    name: {
      type: String
    },
    icNumber: {
      type: String,
      trim: true
    },
    nationality: {
      type: String
    },
    contactNumber: {
      type: Number
    },
    email: {
      type: String,
      trim: true
    },
    occupation: {
      type: String
    },
    income: {
      type: Number
    }
  },

  mother: {
    name: {
      type: String
    },
    icNumber: {
      type: String
    },
    nationality: {
      type: String
    },
    contactNumber: {
      type: Number
    },
    email: {
      type: String,
      trim: true
    },
    occupation: {
      type: String
    },
    income: {
      type: Number
    }
  },

  otherFamily: [{
    _id: false,
    name: {
      type: String
    },
    relationship: {
      type: String
    },
    age: {
      type: Number
    }
  }],
  
  misc: {
    fas: [{
      type: String,
      enum: ['MOE', 'Mendaki', 'Others', 'None']
  }],

    tuition: [{
      type: String,
      enum: ['CDAC', 'Mendaki', 'Private', 'None']
  }],

    academicInfo: [{
      _id: false,
      year: {
        type: Number
      },
      term: {
        type: Number
      },
      english: {
        type: Number
      },
      math: {
        type: Number
      },
      motherTongue: {
        type: Number
      },
      science: {
        type: Number
      },
      overall: {
        type: Number
      }
    }]
  },

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
    default: 'Active'
  }

}, {
  timestamps: true,
  minimize: false
})

module.exports = mongoose.model('Student', StudentSchema)
