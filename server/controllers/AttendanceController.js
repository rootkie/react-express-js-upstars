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

function makeString(obj){
	return (typeof(obj) == 'string') ? obj : JSON.stringify(obj);
}

module.exports.addEditAttendance = async (req, res) => {
  try {
// Sample raw request
// {
//   "date":"20170102",
//   "hours":"2",
//   "classId":"59098787aa54171143d3f3ae",
//   "tutors":["5908abfad4d25a79a80a9c53","5908ac4bd4d25a79a80a9c54"],
//   "students":["591062e9edea5d1ce9fef38d","591064c77780a11e23d72705"]
// }

    let { date, hours, classId, tutors, students } = req.body
    // TO BE DONE ON THE FRONT END
    // class should be the id of the class
    // tutors should be an array of tutor id
    // students should be an array of student id

    // Validation is temporarily neglected
    // Consider validating if class has the students and tutors.

    if (classId == null) {
      throw 'ClassId can not be null'
    }
	  classId = makeString(classId)
    date = makeString(date)
    let hoursInt = parseInt(hours, 10)
    let attendance1 = {
      date: formatDate(date),
      hours: hoursInt,
      class: classId,
      tutors: tutors,
      students: students
    }

    const newAttendance = await Attendance.findOneAndUpdate({class: classId, date: formatDate(date)}, attendance1, {upsert: true, new: true})

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
    classId = makeString(classId)
    date = makeString(date)
    const removed = await Attendance.remove({class: classId, date: formatDate(date)})

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
    dateStart = makeString(dateStart)
    dateEnd = makeString(dateEnd)
    classId = makeString(classId)
    const foundAttendance = await Attendance.find({ date: {'$gte': formatDate(dateStart), '$lte': formatDate(dateEnd) }, class: classId })

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
    classId = makeString(classId)
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
    userId = makeString(userId)
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
    studentId = makeString(studentId)
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
