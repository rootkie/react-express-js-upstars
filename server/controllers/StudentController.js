const axios = require('axios')
const querystring = require('querystring')
const Student = require('../models/student')
const Class = require('../models/class')

// Add student function works for everyone
module.exports.addStudent = async (req, res, next) => {
  let edited = {}
  let { roles } = req.decoded
  const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'status']

  // If editor has no admin rights, restrict the entering of Admin Field
  if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1) {
    edited['admin'] = req.body.admin
  }

  axios.post('https://www.google.com/recaptcha/api/siteverify',
    querystring.stringify({
      secret: '6LdCS1IUAAAAAKByA_qbWeQGuKCgBXNmD_k2XWSK',
      response: req.body.captchaCode
    }))
    .then(async response => {
      console.log(response.data)
      try {
        if (response.data.success === false) {
          throw ({
            status: 401,
            error: 'There is something wrong with the client input. Maybe its the Captcha issue? That is all we know.'
          })
        }
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

        const successStudentSignup = await newStudent.save()
        res.status(201).json({
          newStudent: successStudentSignup
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
    })
}

// Mentor / Admin / SuperAdmin only
module.exports.editStudentById = async (req, res, next) => {
  try {
    // Check if studentId exists
    if (!req.body.studentId) {
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

    // Update student based on studentId
    const editedStudent = await Student.findByIdAndUpdate(req.body.studentId, edited, {
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
      runSettersOnQuery: true
    })
    if (!editedStudent) {
      throw ({
        status: 404,
        error: 'The student you requested to edit does not exist.'
      })
    }
    // Repopulate the classes if the status of the student is changed back to Active
    if (editedStudent.status === 'Active' && editedStudent.classes) {
      await Class.update({
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
      await Class.update({
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
    res.status(200).json({
      editedStudent
    })
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
    }).select('profile')
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
    }).select('profile status')
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
    const student = await Student.findById(studentId).populate('classes', 'className status')
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
    if (!studentId) {
      throw ({
        status: 400,
        error: 'Please provide a studentId and ensure input is correct'
      })
    }

    // Find and delete student from database
    const studentDeleted = await Student.update({
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
          await Class.update({
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
    return res.status(200).json({
      status: 'success',
      deleted: studentDeleted
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
