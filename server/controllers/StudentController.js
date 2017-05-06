const Student = require('../models/student')

// This is authenticated, user info stored in req.decoded

module.exports.addStudent = function (req, res) {
  Student.findOne({ 'profile.name': req.body.name }, function (err, existingStudent) {
    if (err) {
      return res.status(500).send('server error, student insert')
    }
    if (existingStudent) {
      // excute updates
      return res.status(422).send('Studentname already exists')
    }

    const { name, icNumber, email, contactNumber, dateOfBirth, address, gender, schoolType, schoolName } = req.body
    let student = new Student({
      profile: {
        name: name,
        icNumber: icNumber,
        email: email,
        contactNumber: contactNumber,
        dateOfBirth: dateOfBirth,
        address: address,
        gender: gender
      },
      schoolType: schoolType,
      schoolName: schoolName
    })

    student.save((err, newStudent) => {
      if (err) {
        // Printing the error messages.
        Object.values(err.errors).forEach(function (error) { console.log(error.message) })

        return res.status(500).send('server error, student save')
      }
      return res.json({
        status: 'Student created',
        student: newStudent
      })
    })
  })
}

module.exports.getAll = function (req, res) {
  Student.find({}).then((err, classes) => {
    if (err) return res.send(err)
    return res.json({classes: classes, info: req.decoded})
  })
}
module.exports.getStudentById = function (req, res) {
  var studentId = req.params.id
  Student.findOne({
    _id: studentId
  }, (err, student) => {
    if (err) {
      console.log(err)
      return res.status(500).send('Database controller errors')
    }
    return res.json(student)
  })
}

module.exports.dropDB = function (req, res) {
  Student.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({removed: num})
  })
}
