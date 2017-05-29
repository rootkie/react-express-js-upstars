const Student = require('../models/student')
let util = require('../util.js')

// This is authenticated, user info stored in req.decoded
module.exports.addEditStudent = async(req, res) => {
  try {
    let {
      name,
      icNumber,
      email,
      contactNumber,
      dateOfBirth,
      address,
      gender,
      schoolType,
      schoolName
    } = req.body
    let student = {
      profile: {
        name: name,
        icNumber: icNumber,
        email: email,
        contactNumber: contactNumber,
        dateOfBirth: dateOfBirth,
        address: address,
        gender: gender
      },
      classes: [],
      schoolType: schoolType,
      schoolName: schoolName
    }
    icNumber = util.makeString(icNumber)
    const newStudent = await Student.findOneAndUpdate({
      'profile.icNumber': icNumber
    }, student, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    })

    res.json({
      status: 'success',
      student: newStudent
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
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
    const studentId = util.makeString(req.params.id)
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
