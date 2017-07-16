const Attendance = require('../models/attendance')
const User = require('../models/user')
const Class = require('../models/class')
const util = require('../util')

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
        if (classAttendance[j].users.indexOf(userId) !== -1) userAttendance += 1
      }

      totalAttendance += attendanceCount
    }
    const attendanceRate = (userAttendance / totalAttendance * 100).toFixed(2)
    return attendanceRate
  } catch (err) {
    console.log(err)
  }
}

module.exports.getClassSummary = async (req, res) => {
  try {
    let {dateFrom, dateEnd, classId} = req.body
    dateFrom = util.makeString(dateFrom)
    dateEnd = util.makeString(dateEnd)
    classId = util.makeString(classId)
    let class1 = await Class.findById(classId).populate('users', 'profile').populate('students', 'profile.name')

    // Generating Attendance Rate of class
    // This probably can be optimized to run in parallel
    let attendanceRate = {}
    let numUsers = class1.users.length
    attendanceRate['tutorNum'] = numUsers
    for (let i = 0; i < numUsers; i++) {
      let userName = class1.users[i].profile.lastName
      let userId = class1.users[i]._id
      attendanceRate[userName] = await genUserARStat(dateFrom, dateEnd, userId)
    }
    numUsers = class1.students.length
    attendanceRate['studentNum'] = numUsers
    for (let i = 0; i < numUsers; i++) {
      let studentName = class1.students[i].profile.name
      let studentId = class1.students[i]._id
      attendanceRate[studentName] = await genStudentARStat(dateFrom, dateEnd, studentId)
    }

    res.json({
      status: 'success',
      users: attendanceRate.tutorNum,
      students: attendanceRate.studentNum,
      attendanceRate: attendanceRate,
      tutorStudentPercent: attendanceRate.tutorNum / attendanceRate.studentNum * 100,
      studentTutorRatio: attendanceRate.studentNum / attendanceRate.tutorNum
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
