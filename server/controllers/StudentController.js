const axios = require('axios')
const querystring = require('querystring')
const Student = require('../models/student')
const Class = require('../models/class')

// Add student function works for everyone
module.exports.addStudent = async (req, res, next) => {
  const list = ['name', 'icNumber', 'dob', 'address', 'gender', 'nationality', 'classLevel', 'schoolName', 'fatherName', 'fatherIcNumber', 'fatherNationality', 'fatherEmail', 'fatherOccupation', 'fatherContactNumber', 'fatherIncome', 'motherName', 'motherIcNumber', 'motherNationality', 'motherEmail', 'motherOccupation', 'motherContactNumber', 'motherIncome', 'otherFamily', 'fas', 'fsc', 'tuition', 'academicInfo']
  const { captchaCode } = req.body
  let edited = {}

  // Use a loop to populate edited if field is present
  for (let checkChanged of list) {
    // if (req.body[checkChanged]) {
    edited[checkChanged] = req.body[checkChanged]
    // }
  }

  // Force add the admin field so that front-end can parse data properly
  edited = {
    ...edited,
    admin: {
      interviewNotes: '',
      adminNotes: '',
      exitReason: ''
    }
  }

  const newStudent = new Student(edited)
  try {
    const error = await newStudent.validateSync()

    if (error) {
      const error = {
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      }
      throw error
    }

    let secret = process.env.CAPTCHA_SECRET_PROD
    if (process.env.NODE_ENV === 'development') {
      secret = process.env.CAPTCHA_SECRET_DEV
    }

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify',
      querystring.stringify({
        secret,
        response: captchaCode
      }))

    if (response.data.success === false) {
      const error = {
        status: 401,
        error: 'There is something wrong with the client Captcha. That is all we know.'
      }
      throw error
    }

    await newStudent.save()
    res.status(201).json({
      newStudent: true
    })
  } catch (err) {
    console.error(err)
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
  const list = ['name', 'icNumber', 'dob', 'address', 'gender', 'nationality', 'classLevel', 'schoolName', 'fatherName', 'fatherIcNumber', 'fatherNationality', 'fatherEmail', 'fatherOccupation', 'fatherContactNumber', 'fatherIncome', 'motherName', 'motherIcNumber', 'motherNationality', 'motherEmail', 'motherOccupation', 'motherContactNumber', 'motherIncome', 'otherFamily', 'fas', 'fsc', 'tuition', 'academicInfo', 'admin']

  try {
    // Use a loop to populate edited if field is present
    for (let checkChanged of list) {
      // if (req.body[checkChanged]) {
      edited[checkChanged] = req.body[checkChanged]
      // }
    }

    // Update student based on IC Number and validate it
    const newStudent = new Student(edited)
    const error = await newStudent.validateSync()

    if (error) {
      const error = {
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      }
      throw error
    }

    const successStudentSignup = await newStudent.save()
    res.status(201).json({
      newStudentId: successStudentSignup._id
    })
  } catch (err) {
    console.error(err)
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
  const { studentId } = req.body
  try {
    // Check if studentId exists
    if (!(/^[0-9a-fA-F]{24}$/).test(studentId)) {
      const error = {
        status: 400,
        error: 'Please provide a studentId'
      }
      throw error
    }

    let edited = {}
    const list = ['name', 'dob', 'nationality', 'gender', 'address', 'classLevel', 'schoolName', 'fatherName', 'fatherIcNumber', 'fatherNationality', 'fatherEmail', 'fatherOccupation', 'fatherContactNumber', 'fatherIncome', 'motherName', 'motherIcNumber', 'motherNationality', 'motherEmail', 'motherOccupation', 'motherContactNumber', 'motherIncome', 'otherFamily', 'fas', 'fsc', 'tuition', 'academicInfo', 'status', 'admin']

    // Use a loop to populate edited if field is present according to the `list` array
    for (let checkChanged of list) {
      // if (req.body[checkChanged]) {
      edited[checkChanged] = req.body[checkChanged]
      // }
    }

    const studentFound = await Student.findById(studentId)
    if (!studentFound) {
      const error = {
        status: 404,
        error: 'The student you requested to edit does not exist.'
      }
      throw error
    }
    const oldStatus = { ...studentFound.status }
    studentFound.set(edited)
    const editedStudent = await studentFound.save()

    // Repopulate the classes if the status of the student is changed back to Active
    if (req.body.status !== oldStatus) {
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
          timestamps: true
        })
      } else if (editedStudent.status !== 'Active' && editedStudent.classes) {
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
          timestamps: true
        })
      }
    }
    res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        error: 'Our server had issues validating your inputs. Please fill in using proper values'
      })
      // Duplication error code by MongoDB
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
    }).select('name icNumber dob gender').limit(500).lean()
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.error(err)
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
    }).select('name icNumber dob gender status').limit(500).lean()
      .sort('status name')
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

// Everyone with token
module.exports.getStudentById = async (req, res, next) => {
  try {
    const studentId = req.params.id

    // Find student based on ID and retrieve className
    const student = await Student.findById(studentId).populate('classes', 'className status')
      .lean()
    if (!student) {
      const error = {
        status: 404,
        error: 'Student does not exist. Please try again'
      }
      throw error
    }
    return res.status(200).json({
      student
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}
// SuperAdmin only
module.exports.deleteStudent = async (req, res, next) => {
  const { studentId } = req.body
  try {
    // StudentId is an array, thus a regex is used to test every value in the array
    if (!studentId || studentId.length === 0 || !studentId.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please provide a studentId and ensure all values are correct'
      }
      throw error
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
      timestamps: true
    })
    if (studentDeleted.n === 0) {
      const error = {
        status: 404,
        error: 'The student(s) you requested to delete does not exist.'
      }
      throw error
    } else {
      for (let number = 0; number < studentId.length; number++) {
        const studentDetails = await Student.findById(studentId[number], 'classes')
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
            timestamps: true
          })
        }
      }
    }
    return res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Everyone
module.exports.getStudentByName = async (req, res, next) => {
  const { name } = req.params
  try {
    // Find students from database real-time using name
    const studentsFiltered = await Student.find({
      status: 'Active',
      'name': new RegExp(name, 'i')
    }).select('name').limit(30).lean()
    return res.status(200).json({
      studentsFiltered
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

// Admin only
module.exports.getOtherStudentByName = async (req, res, next) => {
  const { name } = req.params
  try {
    // Find other students from database real-time using name
    const studentsFiltered = await Student.find({
      status: {
        $ne: 'Active'
      },
      'name': new RegExp(name, 'i')
    }).select('name').limit(30).lean()
    return res.status(200).json({
      studentsFiltered
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
