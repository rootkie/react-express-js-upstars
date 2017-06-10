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

  profile: {
    name: {
      type: String,
      required: true
    },
    dob: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['M', 'F']
    },
    nationality: {
      type: String
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
      type: String
    },
    schoolName: {
      type: String
    },
    schoolLevel: {
      type: String
    },
    schoolClass: {
      type: String
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

    hobbies: [{  // array of hobbies
      type: String
    }],

    careerGoal: {
      type: String
    },

    education: { 
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
      }]
    },

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
        required: true
      }],
      subjects: [{
        type: String,
        required: true
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
    }

  },

  commencementDate: {
    type: Date
  },

  exitDate: {
    type: Date
  },

  preferredTimeSlot: [{
    type: String
  }],

  status: {
    type: String,
    default: 'Pending'
  },

  roles: [{
    type: String,
    enum: ['SuperAdmin', 'Tutor', 'Admin', 'SuperVisor', 'Mentor', 'External', 'Adhoc', 'Temporary', 'Helper']
  }],

  classes: [{
    type: Schema.ObjectId,
    ref: 'Class'
  }],

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpires: {
    type: Date
  }

}, {
  timestamps: true
})

// Pre-save of user to database, hash password if password is modified or new
// Coz of lexical this, didn't use =>
UserSchema.pre('save', function (next) {
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

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err)
    }

    cb(null, isMatch)
  })
}

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
