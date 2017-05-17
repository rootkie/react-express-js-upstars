const Attendance = require('../models/attendance')
  // Student = require('../models/student'),
  // Class = require('../models/class'),
  // Tutor = require('../models/user')
let util = require('../util.js')

module.exports.addEditAttendance = async (req, res) => {
  try {
// Sample raw request
// {
//   "date":"20170102",
//   "hours":"2",
//   "classId":"59098787aa54171143d3f3ae",
//   "users":["5908abfad4d25a79a80a9c53","5908ac4bd4d25a79a80a9c54"],
//   "students":["591062e9edea5d1ce9fef38d","591064c77780a11e23d72705"]
// }

    let { date, hours, classId, users, students, type } = req.body
    // TO BE DONE ON THE FRONT END
    // class should be the id of the class
    // users should be an array of user id
    // students should be an array of student id

    // Validation is temporarily neglected
    // Consider validating if class has the students and tutors.

    if (classId == null) {
      throw 'ClassId can not be null'
    }
	  classId = util.makeString(classId)
    date = util.makeString(date)
    type = util.makeString(type)
    let hoursInt = parseInt(hours, 10)
    if (type !== 'Class') hoursInt = 0

    let attendance1 = {
      date: util.formatDate(date),
      hours:hoursInt,
      class: classId,
      users: users,
      students: students,
      type: type
    }

    const newAttendance = await Attendance.findOneAndUpdate({class: classId, date: util.formatDate(date)}, attendance1, {upsert: true, new: true, setDefaultsOnInsert: true})

    res.json({
      status: 'success',
      attendance: newAttendance
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteAttendance = async (req, res) => {
  try {
    let {date, classId} = req.body
    classId = util.makeString(classId)
    date = util.makeString(date)
    const removed = await Attendance.remove({class: classId, date: util.formatDate(date)})

    res.json({
      status: 'success',
      removed: removed
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceBetween = async (req, res) => {
  try {
    let { dateStart, dateEnd, classId } = req.body
    if (classId == null) {
      throw 'ClassId cannot be null'
    }
    dateStart = util.makeString(dateStart)
    dateEnd = util.makeString(dateEnd)
    classId = util.makeString(classId)
    const foundAttendance = await Attendance.find({ date: {'$gte': util.formatDate(dateStart), '$lte': util.formatDate(dateEnd) }, class: classId })

    res.json({
      status: 'success',
      foundAttendance: foundAttendance
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceByClass = async (req, res) => {
  try {
    let { classId } = req.params
    classId = util.makeString(classId)
    const foundAttendances = await Attendance.find({ class: classId })
    res.json({
      status: 'success',
      foundAttendances: foundAttendances
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceByUser = async (req, res) => {
  try {
    let { userId } = req.params
    userId = util.makeString(userId)
    const foundAttendances = await Attendance.find({ tutors: userId }).populate('tutors', ['profile'])
    res.json({
      status: 'success',
      foundAttendances: foundAttendances
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceByStudent = async (req, res) => {
  try {
    let { studentId } = req.params
    studentId = util.makeString(studentId)
    const foundAttendances = await Attendance.find({ students: studentId }).populate('students', ['profile.name'])
    res.json({
      status: 'success',
      foundAttendances: foundAttendances
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceUserFromClass = async (req, res) => {
  try {
    let {classId, userId} = req.body
    classId = util.makeString(classId)
    userId = util.makeString(userId)
    let records = await Attendance.find({ class: classId, tutor: userId})
    res.json({
      status: 'success',
      records: records
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
