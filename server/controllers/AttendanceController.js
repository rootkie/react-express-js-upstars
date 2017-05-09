const Attendance = require('../models/attendance'),
  Student = require('../models/student'),
  Class = require('../models/class'),
  Tutor = require('../models/user')

function formatDate (yymmdd) {
  let year = yymmdd.substring(0, 4)
  let month = yymmdd.substring(4, 6)
  let day = yymmdd.substring(6, 8)
  let dateString = year + '-' + month + '-' + day
  return new Date(dateString)
}

module.exports.addEditAttendance = async (req, res) => {
  try {
    const { date, hours, classId, tutors, students } = req.body
        // TO BE DONE ON THE FRONT END
        // class should be the id of the class
        // tutors should be an array of tutor id
        // students should be an array of student id

        // Validation is temporarily neglected
        // Consider validating if class has the students and tutors.
    let hoursInt = parseInt(hours, 10)
    let attendance1 = {
      date: formatDate(date),
      hours: hoursInt,
      class: classId,
      tutors: tutors,
      students: students
    }

    const newAttendance = await Attendance.findOneAndUpdate({class: classId}, attendance1, {upsert: true, new: true})

    res.json({
      status: 'success',
      attendance: newAttendance
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

