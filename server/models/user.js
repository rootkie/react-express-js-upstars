const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

// ================================
// User Schema
// ================================
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  name: {
    type: String,
    trim: true,
    required: true,
    index: true
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
    trim: true,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  postalCode: {
    type: Number,
    required: true
  },

  handphone: {
    type: Number,
    required: true
  },

  homephone: {
    type: Number,
    required: true
  },

  schoolLevel: {
    type: String
  },

  schoolClass: {
    type: String
  },

  fatherName: {
    type: String
  },
  fatherOccupation: {
    type: String
  },
  fatherEmail: {
    type: String,
    trim: true
  },

  motherName: {
    type: String
  },
  motherOccupation: {
    type: String
  },
  motherEmail: {
    type: String,
    trim: true
  },

  hobbies: {
    type: String
  },

  careerGoal: {
    type: String
  },

  formalEducation: [{
    _id: false,
    dateFrom: {
      type: Date,
      required: true
    },
    dateTo: {
      type: Date,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    highestLevel: {
      type: String,
      required: true
    }
  }],

  coursesSeminar: [{
    _id: false,
    year: {
      type: Number,
      required: true
    },
    courseAndObjective: {
      type: String,
      required: true
    }
  }],

  achievements: [{
    _id: false,
    dateFrom: {
      type: Date,
      required: true
    },
    dateTo: {
      type: Date,
      required: true
    },
    organisation: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],

  cca: [{
    _id: false,
    dateFrom: {
      type: Date,
      required: true
    },
    dateTo: {
      type: Date,
      required: true
    },
    organisation: {
      type: String,
      required: true
    },
    rolePosition: {
      type: String,
      required: true
    }
  }],

  cip: [{
    _id: false,
    dateFrom: {
      type: Date,
      required: true
    },
    dateTo: {
      type: Date,
      required: true
    },
    organisation: {
      type: String,
      required: true
    },
    rolePosition: {
      type: String,
      required: true
    }
  }],

  workInternExp: [{
    _id: false,
    dateFrom: {
      type: Date,
      required: true
    },
    dateTo: {
      type: Date,
      required: true
    },
    organisation: {
      type: String,
      required: true
    },
    rolePosition: {
      type: String,
      required: true
    }
  }],

  languages: {
    type: String
  },

  subjects: {
    type: String
  },

  interests: {
    type: String
  },

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

  preferredTimeSlot: {
    type: Array,
    required: true
  },

  status: {
    type: String,
    default: 'Unverified',
    required: true
  },

  roles: [{
    type: String,
    required: true,
    enum: ['SuperAdmin', 'Tutor', 'Admin', 'SuperVisor', 'Mentor', 'Adhoc', 'Temporary']
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
  }

}, {
  timestamps: true,
  minimize: false
})

// Pre-save of user to database, hash password if password is modified or new
// Coz of lexical this, didn't use =>
UserSchema.pre('save', function (next) {
  const user = this
  const SALT_FACTOR = 5
  this.increment()
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

UserSchema.pre('findOneAndUpdate', function (next) {
  this.updateMany({ $inc: { __v: 1 } })
  next()
})

UserSchema.pre('updateMany', function (next) {
  this.updateMany({ $inc: { __v: 1 } })
  next()
})

UserSchema.methods.comparePasswordPromise = function (candidatePassword) { // Coz of lexical this
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
