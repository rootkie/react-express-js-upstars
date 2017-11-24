const Student = require('../models/student')

// Add student function works for SA only. If need ability for students to sign up, please tell me.
module.exports.addStudent = async(req, res, next) => {
  try {
    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'status']

    // If editor has no admin rights, restrict the entering of Admin Field
    if (req.body.admin) {
      edited['admin'] = req.body.admin
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
}

// Mentor / Admin / SuperAdmin only
module.exports.editStudentById = async(req, res, next) => {
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
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
      runSettersOnQuery: true
    })

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
module.exports.getAll = async(req, res, next) => {
  try {
    // Find all students from database
    const students = await Student.find({})
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
// Everyone with token
module.exports.getStudentById = async(req, res, next) => {
  try {
    let studentId = req.params.id

    // Find student based on ID and retrieve className
    const student = await Student.findById(studentId).populate('classes', 'className')
    return res.status(200).json({
      student
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
// SuperAdmin only
module.exports.deleteStudent = async(req, res, next) => {
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
    const studentDeleted = await Student.remove({
      '_id': {
        '$in': studentId
      }
    })
    if (studentDeleted.result.n === 0) {
      return res.status(404).json({
        error: 'student not found'
      })
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
