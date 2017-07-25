const Student = require('../models/student')

// Add student function works for both admin and usual student sign up
module.exports.addStudent = async(req, res) => {
  try {
    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'status']
      // If not admin editing, restrict the entering of Admin Field
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
    // Update student based on IC Number
    const newStudent = new Student(edited)
    const error = await newStudent.validateSync()
    if (error) {
      return res.status(400).send('Error Saving: Fill in all required fields accurately')
    }
    const successStudentSignup = await newStudent.save()
    res.status(201).json({
      newStudent: successStudentSignup
    })
  } catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      return res.status(400).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    if (err.code == 11000) {
      return res.status(400).send('You have already signed up an account. If this is a mistake please contact our system admin.')
    } else res.status(500).send('server error')
  }
}

module.exports.editStudentById = async(req, res) => {
  try {
    if (!req.body.studentId) {
      return res.status(400).send('Please provide a valid studentId')
    }

    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'status', 'admin']
      // Use a loop to populate edited if field is present
    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }
    // Update student based on IC Number
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
    if (err.name == 'ValidationError') {
      res.status(400).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    if (err.code == 11000) {
      return res.status(400).send('You have already signed up an account. If this is a mistake please contact our system admin.')
    } else res.status(500).send('server error')
  }
}

module.exports.getAll = async(req, res) => {
  try {
    const students = await Student.find({})
    return res.status(200).json({
      students
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getStudentById = async(req, res) => {
  try {
    let studentId = req.params.id
    const student = await Student.findById(studentId).populate('classes', 'className')
    return res.status(200).json({
      student
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteStudent = async(req, res) => {
  let {
    studentId
  } = req.body
  if (!studentId) return res.status(400).send('studentId is required')
  try {
    const studentDeleted = await Student.findByIdAndRemove(studentId)
    if (!studentDeleted) return res.status(404).json({ error: 'student not found' })
    return res.status(200).json({
      deleted: studentDeleted.profile
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
