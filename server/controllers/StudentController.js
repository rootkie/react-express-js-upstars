const Student = require('../models/student')

// Add student function works for both admin and usual student sign up
module.exports.addStudent = async(req, res, next) => {
  try {
    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'status']

    // If editor has no admin rights, restrict the entering of Admin Field
    if (req.decoded && (req.decoded.roles.indexOf('Admin') != -1 || req.decoded.roles.indexOf('SuperAdmin') != -1)) {
      if (req.body.admin) {
        edited['admin'] = req.body.admin
      }
    }

    // Use a loop to populate edited if field is present
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    // Update student based on IC Number and validate it
    const newStudent = new Student(edited)
    const error = await newStudent.validateSync();
    if (error) throw ({
      status: 400,
      error: 'There is something wrong with the client input. That is all we know.'
    })

    const successStudentSignup = await newStudent.save()
    res.json({
      status: 'success',
      successStudentSignup
    })
  }
  catch (err) {
    console.log(err)
    if (err.code == 11000) {
      return res.status(400).send('Account already exist. If this is a mistake please contact our system admin.')
    }
    else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}

module.exports.editStudentById = async(req, res, next) => {
  try {
    // Check if studentId exists
    if (!req.body.studentId) throw ({
      status: 400,
      error: 'Please provide a studentId'
    })

    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'status', 'admin']

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

    res.json({
      status: 'success',
      editedStudent
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      return res.status(400).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    else if (err.code == 11000) {
      return res.status(400).send('You have already signed up an account. If this is a mistake please contact our system admin.')
    }
    else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}

module.exports.getAll = async(req, res, next) => {
  try {
    // Find all students from database
    const students = await Student.find({})
    res.json({
      students: students,
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getStudentById = async(req, res, next) => {
  try {
    let studentId = req.params.id

    // Find student based on ID and retrieve className
    const student = await Student.findById(studentId).populate('classes', 'className')

    res.json({
      student
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.deleteStudent = async(req, res, next) => {
  let {
    studentId
  } = req.body
  try {
    if (!studentId) throw ({
      status: 400,
      error: 'Please provide a studentId'
    })

    // Find and delete student from database
    const studentDeleted = await Student.findByIdAndRemove(studentId)
    res.json({
      studentDeleted
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}
