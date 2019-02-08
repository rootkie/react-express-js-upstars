const axios = require('axios')
const querystring = require('querystring')
const Student = require('../models/student')
const Class = require('../models/class')

// Add student function works for everyone
module.exports.addStudent = async (req, res, next) => {
  const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'status']
  let {captchaCode} = req.body
  let edited = {}

  // Use a loop to populate edited if field is present
  for (let checkChanged of list) {
    if (req.body[checkChanged]) {
      edited[checkChanged] = await req.body[checkChanged]
    }
  }

  const newStudent = new Student(edited)
  try {
    const error = await newStudent.validateSync()

    if (error) {
      console.error(error)
      throw ({
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      })
    }

    let secret
    if (process.env.NODE_ENV === 'development') {
      secret = process.env.CAPTCHA_SECRET_DEV
    } else {
      secret = process.env.CAPTCHA_SECRET_PROD
    }

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify',
      querystring.stringify({
        secret,
        response: captchaCode
      }))

    if (response.data.success === false) {
      throw ({
        status: 401,
        error: 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'
      })
    }

    const successStudentSignup = await newStudent.save()
    res.status(201).json({
      newStudent: successStudentSignup._id
    })
  } catch (err) {
    console.log(err)
    if (err.code === 11000) {
      return res.status(400).send({
        error: 'Account already exist. If this is a mistake please contact our system admin.'
      })
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.adminAddStudent = async (req, res, next) => {
  let edited = {}
  const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'status', 'admin']
  let {captchaCode} = req.body
  let secret

  try {
    // Use a loop to populate edited if field is present
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    // Update student based on IC Number and validate it
    const newStudent = new Student(edited)
    const error = await newStudent.validateSync()

    if (error) {
      console.error(error)
      throw ({
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      })
    }

    if (process.env.NODE_ENV === 'development') {
      secret = process.env.CAPTCHA_SECRET_DEV
    } else {
      secret = process.env.CAPTCHA_SECRET_PROD
    }
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify',
      querystring.stringify({
        secret,
        response: captchaCode
      }))

    if (response.data.success === false) {
      throw ({
        status: 401,
        error: 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'
      })
    }
    const successStudentSignup = await newStudent.save()
    res.status(201).json({
      newStudentId: successStudentSignup._id
    })
  } catch (err) {
    console.log(err)
    if (err.code === 11000) {
      return res.status(400).send({
        error: 'Account already exist. If this is a mistake please contact our system admin.'
      })
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Mentor / Admin / SuperAdmin only
module.exports.editStudentById = async (req, res, next) => {
  try {
    // Check if studentId exists
    if (!(/^[0-9a-fA-F]{24}$/).test(req.body.studentId)) {
      throw ({
        status: 400,
        error: 'Please provide a studentId'
      })
    }

    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'status', 'admin']

    // Use a loop to populate edited if field is present according to the `list` array
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    let studentFound = await Student.findById(req.body.studentId)
    if (!studentFound) {
      throw ({
        status: 404,
        error: 'The student you requested to edit does not exist.'
      })
    }

    studentFound.set(edited)
    const editedStudent = await studentFound.save()

    // Repopulate the classes if the status of the student is changed back to Active
    if (editedStudent.status === 'Active' && editedStudent.classes) {
      await Class.updateMany({
        _id: {
          $in: editedStudent.classes
        }
      }, {
        $addToSet: {
          students: editedStudent._id
        }
      }, {
        new: true,
        multi: true
      })
    } else if (editedStudent.classes) {
      // If status if changed to anything other than Active, we will delete their IDs from the classes instead
      await Class.updateMany({
        _id: {
          $in: editedStudent.classes
        }
      }, {
        $pull: {
          students: editedStudent._id
        }
      }, {
        new: true,
        multi: true
      })
    }
    res.status(200).send()
  } catch (err) {
    console.log(err)
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        error: 'Our server had issues validating your inputs. Please fill in using proper values'
      })
    } else if (err.code === 11000) {
      return res.status(400).send({
        error: 'You have already signed up an account. If this is a mistake please contact our system admin.'
      })
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Everyone
module.exports.getAll = async (req, res, next) => {
  try {
    // Find all students from database
    const students = await Student.find({
      status: 'Active'
    }).select('profile.name profile.icNumber profile.dob profile.gender').limit(500).lean()
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getOtherStudents = async (req, res, next) => {
  try {
    // Find all students from database
    const students = await Student.find({
      status: {
        $ne: 'Active'
      }
    }).select('profile.name profile.icNumber profile.dob profile.gender status').limit(500).lean()
      .sort('status profile.name')
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

// Everyone with token
module.exports.getStudentById = async (req, res, next) => {
  try {
    let studentId = req.params.id

    // Find student based on ID and retrieve className
    const student = await Student.findById(studentId).populate('classes', 'className status').select('-createdAt -updatedAt').lean()
    if (!student) {
      throw ({
        status: 404,
        error: 'Student does not exist. Please try again'
      })
    }
    return res.status(200).json({
      student
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}
// SuperAdmin only
module.exports.deleteStudent = async (req, res, next) => {
  let {
    studentId
  } = req.body
  try {
    if (!studentId || studentId.length === 0 || !studentId.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      throw ({
        status: 400,
        error: 'Please provide a studentId and ensure input is correct'
      })
    }

    // Find and delete student from database
    const studentDeleted = await Student.updateMany({
      '_id': {
        '$in': studentId
      },
      status: {
        '$ne': 'Deleted'
      }
    }, {
      status: 'Deleted'
    }, {
      multi: true
    })
    if (studentDeleted.n === 0) {
      throw ({
        status: 404,
        error: 'The student you requested to delete does not exist.'
      })
    } else {
      for (let number = 0; number < studentId.length; number++) {
        let studentDetails = await Student.findById(studentId[number], 'classes')
        console.log(studentDetails)
        if (studentDetails.classes) {
          await Class.updateMany({
            _id: {
              $in: studentDetails.classes
            }
          }, {
            $pull: {
              students: studentDetails._id
            }
          }, {
            new: true,
            multi: true
          })
        }
      }
    }
    return res.status(200).send()
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Everyone
module.exports.getStudentByName = async (req, res, next) => {
  let {name} = req.params
  try {
    // Find students from database real-time using name
    const studentsFiltered = await Student.find({
      status: 'Active',
      'profile.name': new RegExp(name, 'i')
    }).select('profile.name').limit(30).lean()
    return res.status(200).json({
      studentsFiltered
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

// Admin only
module.exports.getOtherStudentByName = async (req, res, next) => {
  let {name} = req.params
  try {
    // Find other students from database real-time using name
    const studentsFiltered = await Student.find({
      status: {
        $ne: 'Active'
      },
      'profile.name': new RegExp(name, 'i')
    }).select('profile.name').limit(30).lean()
    return res.status(200).json({
      studentsFiltered
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
