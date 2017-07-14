const Attendance = require('../models/attendance')
let util = require('../util.js')
let mongoose = require('mongoose')

module.exports.addEditAttendance = async(req, res) => {
  try {
    // Sample raw request
    /*{
        "date":"20170104",
        "hours":2,
        "classId":"5912f4202a23635d58e7a67e",
        "users":[{
        		"list": "5908abfad4d25a79a80a9c53",
        		"status": 1
        }, {
        	"list": "5908ac4bd4d25a79a80a9c54",
        	"status": 0
        }],
        "students":[{
        		"list": "591062e9edea5d1ce9fef38d",
        		"status": 1
        }, {
        		"list": "591064c77780a11e23d72705",
        		"status": 1
        	}],
        "type": "Class"
      } */

    let {
      date,
      hours,
      classId,
      users,
      students,
      type
    } = req.body

    if (!classId) {
      return res.status(422).json('ClassId can not be null')
    }
    let hoursInt = parseInt(hours, 10)
    if (type !== 'Class') hoursInt = 0

    let attendance1 = {
      date: util.formatDate(date),
      hours: hoursInt,
      class: classId,
      users,
      students,
      type
    }

    const newAttendance = await Attendance.findOneAndUpdate({
      class: classId,
      date: util.formatDate(date)
    }, attendance1, {
      upsert: true,
      new: true,
      runValidators: true
    })

    res.json({
      status: 'success',
      attendance: newAttendance
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

module.exports.deleteAttendance = async(req, res) => {
  try {
    let {
      date,
      classId
    } = req.body
    if (!classId || !date) {
      return res.status(422).json('ClassId or date cannot be empty')
    }
    const removed = await Attendance.remove({
      class: classId,
      date: util.formatDate(date)
    })

    res.json({
      status: 'success',
      removed
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}


module.exports.getAttendanceByClass = async(req, res) => {
  try {
    let {
      classId,
      dateStart,
      dateEnd
    } = req.body


    let attendances = Attendance.find()
      .limit(100)
      .populate('class', ['className'])
      .sort('class.className -date')

    if (classId) {
      attendances = attendances.where('class').equals(classId)
    }
    if (dateStart) {
      attendances = attendances.where('date').gte(util.formatDate(dateStart))
    }
    if (dateEnd) {
      attendances = attendances.where('date').lte(util.formatDate(dateEnd))
    }
    // else the query is empty and every single record from past till now is obtained, similar to a getAll function


    const foundAttendances = await attendances.exec()

    res.json({
      status: 'success',
      foundAttendances
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceByUser = async(req, res) => {
  try {
    let {
      userId,
      classId,
      dateStart,
      dateEnd
    } = req.body

    let attendances = Attendance.find({
        'users.list': userId
      })
      .populate('users.list', ['profile.name'])
      .populate('class', ['className'])
      .sort('class.className -date')
      .select('users.$ date class')

    if (classId) {
      attendances = attendances.where('class').equals(classId)
    }
    if (dateStart) {
      attendances = attendances.where('date').gte(util.formatDate(dateStart))
    }
    if (dateEnd) {
      attendances = attendances.where('date').lte(util.formatDate(dateEnd))
    }

    const foundAttendances = await attendances.exec()

    res.json({
      status: 'success',
      foundAttendances
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAttendanceByStudent = async(req, res) => {
  try {
    let {
      studentId,
      classId,
      dateStart,
      dateEnd
    } = req.body


    let attendances = Attendance.find({
        'students.list': studentId
      })
      .populate('students.list', ['profile.name'])
      .populate('class', ['className'])
      .sort('class.className -date')
      .select('students.$ date class')

    if (classId) {
      attendances = attendances.where('class').equals(classId)
    }
    if (dateStart) {
      attendances = attendances.where('date').gte(util.formatDate(dateStart))
    }
    if (dateEnd) {
      attendances = attendances.where('date').lte(util.formatDate(dateEnd))
    }

    const foundAttendances = await attendances.exec()

    res.json({
      status: 'success',
      foundAttendances
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getClassAttendanceSummary = async(req, res) => {
  try {
    let {
      classId
    } = req.body
    if (!classId) {
      return res.status(422).json('ClassId cannot be null')
    }
    const foundAttendanceforUser = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      })
      .unwind('users')
      .sort('-date')
      .group({
        '_id': '$users.list',
        'userAttendance': {
          '$push': {
            'status': '$users.status',
            'date': '$date'
          }
        },
        'total': {
          '$sum': 1
        },
        'attended': {
          '$sum': '$users.status'
        }
      })
      .lookup({
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userName'
      })
      .project({
        userName: '$userName.profile.name',
        userAttendance: '$userAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      })

    const foundAttendanceforStudent = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      })
      .unwind('students')
      .sort('-date')
      .group({
        '_id': '$students.list',
        'studentAttendance': {
          '$push': {
            'status': '$students.status',
            'date': '$date'
          }
        },
        'total': {
          '$sum': 1
        },
        'attended': {
          '$sum': '$students.status'
        }
      })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'studentName'
      })
      .project({
        studentName: '$studentName.profile.name',
        studentAttendance: '$userAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      })

    res.json({
      status: 'success',
      foundAttendanceforUser,
      foundAttendanceforStudent
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
