const Student = require('../models/student')

// Add student function works for both admin and usual student sign up
module.exports.addStudent = async(req, res) => {
  try {
    let edited = {}

    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'status']
      // If not admin editing, restrict the entering of Admin Field
    if (req.decoded && req.decoded.roles.indexOf('Admin') != -1) {
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
    const error = await newStudent.validateSync();
    if (error) {
      return res.status(422).send('Error Saving: Fill in all required fields accurately')
    }
    const successStudentSignup = await newStudent.save()
    res.json({
      status: 'success',
      successStudentSignup
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      return res.status(422).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    if (err.code == 11000) {
      return res.status(422).send('You have already signed up an account. If this is a mistake please contact our system admin.')
    }
    else res.status(500).send('server error')
  }
}

module.exports.editStudentById = async(req, res) => {
  try {

    if (!req.body.studentId) {
      return res.status(422).send('Please provide a valid studentId')
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

    res.json({
      status: 'success',
      editedStudent
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      res.status(422).send('Our server had issues validating your inputs. Please fill in using proper values')
    }
    if (err.code == 11000) {
      return res.status(422).send('You have already signed up an account. If this is a mistake please contact our system admin.')
    }
    else res.status(500).send('server error')
  }
}

module.exports.getAll = async(req, res) => {
  try {
    const students = await Student.find({})
    return res.json({
      students: students,
      info: req.decoded
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}



module.exports.getStudentById = async(req, res) => {
  try {
    let studentId = req.params.id
    const student = await Student.findById(studentId).populate('classes', 'className')
    return res.json({
      student
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.dropDB = function(req, res) {
  Student.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({
      removed: num
    })
  })
}
