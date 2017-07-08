const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

// ================================
// User Schema
// ================================
const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  dob: {
    type: Date,
    required: true
  },

  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },

  nationality: {
    type: String,
    required: true
  },

  nric: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  postalCode: {
    type: String,
    required: true
  },

  handphone: {
    type: String,
    required: true
  },

  homephone: {
    type: String,
    required: true
  },

  schoolName: {
    type: String,
    required: true
  },

  schoolLevel: {
    type: String,
    required: true
  },

  schoolClass: {
    type: String,
    required: true
  },

  father: {
    name: {
      type: String
    },
    occupation: {
      type: String
    },
    email: {
      type: String
    }
  },

  mother: {
    name: {
      type: String
    },
    occupation: {
      type: String
    },
    email: {
      type: String
    }
  },

  hobbies: [{ // array of hobbies
    type: String
    }],

  careerGoal: {
    type: String
  },

  formerEducation: [{ // require at least 1 entry
    dateFrom: { // MMYYYY
      type: Date
    },
    dateTo: {
      type: Date
    },
    school: {
      type: String
    },
    highestLevel: {
      type: String
    }
      }],

  coursesSeminar: [{
    year: { // YYYY only
      type: Date
    },
    courseAndObjective: {
      type: String
    }
      }],

  achievements: [{
    dateFrom: { // MMYYYY
      type: Date
    },
    dateTo: {
      type: Date
    },
    organisation: {
      type: String
    },
    description: {
      type: String
    }
    }],

  cca: [{
    dateFrom: { // MMYYYY
      type: Date
    },
    dateTo: {
      type: Date
    },
    organisation: {
      type: String
    },
    rolePosition: {
      type: String
    }
    }],

  cip: [{
    dateFrom: { // MMYYYY
      type: Date
    },
    dateTo: {
      type: Date
    },
    organisation: {
      type: String
    },
    rolePosition: {
      type: String
    }
    }],

  workInternExp: [{
    dateFrom: { // MMYYYY
      type: Date
    },
    dateTo: {
      type: Date
    },
    organisation: {
      type: String
    },
    rolePosition: {
      type: String
    }
    }],

  competence: [{
    languages: [{
      type: String,
      }],
    subjects: [{
      type: String,
      }],
    interests: [{
      type: String
      }]
    }],

  purposeObjectives: {
    type: String
  },

  developmentGoals: {
    type: String
  },

  commencementDate: {
    type: Date,
    required: true
  },

  exitDate: {
    type: Date,
    required: true
  },

  preferredTimeSlot: [{
    type: String,
    required: true
  }],

  status: {
    type: String,
    default: 'Pending',
    required: true
  },

  roles: [{
    type: String,
    required: true,
    enum: ['SuperAdmin', 'Tutor', 'Admin', 'SuperVisor', 'Mentor', 'External', 'Adhoc', 'Temporary', 'Helper']
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
    }
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpires: {
    type: Date
  }

}, {
  timestamps: true,
  minimize: false
})

// Pre-save of user to database, hash password if password is modified or new
// Coz of lexical this, didn't use =>
UserSchema.pre('save', function(next) {
  const user = this
  const SALT_FACTOR = 5

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err)
    }

    cb(null, isMatch)
  })
}

UserSchema.methods.comparePasswordPromise = function(candidatePassword) { // Coz of lexical this
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        return reject(err)
      }
      resolve(isMatch)
    })
  })
}

module.exports = mongoose.model('User', UserSchema)
