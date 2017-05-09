const Student = require('../models/student')


function makeString(obj){
  return (typeof(obj) == 'string') ? obj : JSON.stringify(obj);
}
// This is authenticated, user info stored in req.decoded
module.exports.addEditStudent = async (req, res) => {
  try {
    let { name, icNumber, email, contactNumber, dateOfBirth, address, gender, schoolType, schoolName } = req.body
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
      classes: [],
      schoolType: schoolType,
      schoolName: schoolName
    })
    icNumber = makeString(icNumber)
    const newStudent = await Student.findOneAndUpdate({ 'profile.icNumber': icNumber}, student, {upsert: true, new: true})

    res.json({
      status: 'success',
      student: newStudent
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAll = function (req, res) {
  Student.find({}).then((err, classes) => {
    if (err) return res.send(err)
    return res.json({classes: classes, info: req.decoded})
  })
}
module.exports.getStudentById = function (req, res) {
  var studentId = makeString(req.params.id)
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
