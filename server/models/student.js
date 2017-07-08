const mongoose = require('mongoose')
const Schema = mongoose.Schema

// ================================
// User Schema
// ================================
const StudentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  
  icNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  contactNumber: {
    type: Number,
    required: true
  },
  
  dateOfBirth: {
    type: String,
    required: true
  },
  
  address: {
    type: String,
    required: true
  },
  
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female'],
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
    type: String
  },
  
  classes: [{
    type: Schema.ObjectId,
    ref: 'Class'
  }],
  
  father: {
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
      type: String
    },
    email: {
      type: String
    },
    occupation: {
      type: String
    },
    income: {
      type: String
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
      type: String
    },
    email: {
      type: String
    },
    occupation: {
      type: String
    },
    income: {
      type: String
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
  
  fas: [{
    type: String,
    enum: ['MOE', 'Mendaki', 'Others', 'None']
  }],
  
  tuition: [{
    type: String,
    enum: ['CDAC', 'Mendaki', 'Private', 'None']
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
    }],
    
  status: {
    type: String,
    default: 'Active'
  }
  
}, {
  timestamps: true,
  minimize: false
})

module.exports = mongoose.model('Student', StudentSchema)
