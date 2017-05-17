const Attendance = require('../models/attendance')
const User = require('../models/user')
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

module.exports.getAttendanceRateUser = async (req, res) => {
  try {
    let {dateFrom, dateEnd, userId} = req.body
    dateFrom = util.makeString(dateFrom)
    dateEnd = util.makeString(dateEnd)
    userId = util.makeString(userId)
    let user = await User.findById(userId)

    let numOfClasses = user.classes.length

    let totalAttendance = 0
    let userAttendance = 0
    for (let i = 0; i < numOfClasses; i++) {
      let classAttendance = await Attendance.find({ date: { '$gte': util.formatDate(dateFrom), '$lte': util.formatDate(dateEnd) }, class: user.classes[i] })
      let attendanceCount = classAttendance.length
      for (let j = 0; j < attendanceCount; j++) {
        if (classAttendance[j].tutors.indexOf(userId)) userAttendance += 1
      }

      totalAttendance += classAttendance.length
    }
    const attendanceRate = (userAttendance / totalAttendance * 100).toFixed(2)
    res.json({
      status: 'success',
      attendanceRate: attendanceRate
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
