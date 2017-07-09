const Student = require('../models/student')
let util = require('../util.js')

// This is authenticated, user info stored in req.decoded
module.exports.addEditStudent = async(req, res) => {
  try {
    let {
      profile
    } = req.body

    let edited = {}

    if (!profile.icNumber) {
      res.status(422).send('Please provide a valid NRIC number')
    }
    const list = ['profile', 'father', 'mother', 'misc', 'otherFamily', 'misc', 'admin', 'status']

    for (let checkChanged of list) {
      if (req.body[checkChanged]) {
        edited[checkChanged] = await req.body[checkChanged]
      }
    }

    const newStudent = await Student.findOneAndUpdate({
      'profile.icNumber': edited.profile.icNumber
    }, edited, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
      runSettersOnQuery: true
    })

    res.json({
      status: 'success',
      newStudent
    })
  }
  catch (err) {
    console.log(err)
    if (err.name == 'ValidationError') {
      res.status(422).send('Our server had issues validating your inputs. Please fill in using proper values')
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
