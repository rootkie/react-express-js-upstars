const Attendance = require('../models/attendance')
const User = require('../models/user')
const Student = require('../models/student')
const util = require('../util')

module.exports.getCipUser = async (req, res) => {
  try {
    const userId = util.makeString(req.params.userId)
    let records = await Attendance.find({ tutors: userId }, {hours: 1})
    const size = records.length
    let sum = 0
    for (let i = 0; i < size; i++) {
      sum += records[i].hours
    }
    res.json({
      status: 'success',
      hours: sum
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

async function genUserARStat (dateFrom, dateEnd, userId) {
  try {
    let user = await User.findById(userId)

    let numOfClasses = user.classes.length

    let totalAttendance = 0
    let userAttendance = 0
    for (let i = 0; i < numOfClasses; i++) {
      let classAttendance = await Attendance.find({ date: { '$gte': util.formatDate(dateFrom), '$lte': util.formatDate(dateEnd) }, class: user.classes[i] })
      let attendanceCount = classAttendance.length
      for (let j = 0; j < attendanceCount; j++) {
        if (classAttendance[j].tutors.indexOf(userId) !== -1) userAttendance += 1
      }

      totalAttendance += attendanceCount
    }
    const attendanceRate = (userAttendance / totalAttendance * 100).toFixed(2)
    return attendanceRate
  } catch (err) {
    console.log(err)
  }
}

module.exports.getAttendanceRateUser = async (req, res) => {
  try {
    let {dateFrom, dateEnd, userId} = req.body
    dateFrom = util.makeString(dateFrom)
    dateEnd = util.makeString(dateEnd)
    userId = util.makeString(userId)
    const attendanceRate = await genUserARStat(dateFrom, dateEnd, userId)
    res.json({
      status: 'success',
      attendanceRate: attendanceRate
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

async function genStudentARStat (dateFrom, dateEnd, studentId) {
  try {
    let student = await Student.findById(studentId)
    let numOfClasses = student.classes.length

    let totalAttendance = 0
    let studentAttendance = 0
    
    for (let i = 0; i < numOfClasses; i++) {
      let classAttendance = await Attendance.find({ date: { '$gte': util.formatDate(dateFrom), '$lte': util.formatDate(dateEnd) }, class: student.classes[i] })
      let attendanceCount = classAttendance.length
      for (let j = 0; j < attendanceCount; j++) {
        if (classAttendance[j].students.indexOf(studentId) !== -1) studentAttendance += 1
      }
      totalAttendance += attendanceCount
    }
    const attendanceRate = (studentAttendance / totalAttendance * 100).toFixed(2)
    return attendanceRate
  } catch (err) {
    throw err
  }
}

module.exports.getAttendanceRateStudent = async (req, res) => {
  try {
    let {dateFrom, dateEnd, studentId} = req.body
    dateFrom = util.makeString(dateFrom)
    dateEnd = util.makeString(dateEnd)
    studentId = util.makeString(studentId)
    const attendanceRate = await genStudentARStat(dateFrom, dateEnd, studentId)
    res.json({
      status: 'success',
      attendanceRate: attendanceRate
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
