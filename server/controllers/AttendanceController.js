const Attendance = require('../models/attendance')
let util = require('../util.js')
let mongoose = require('mongoose')

module.exports.addEditAttendance = async(req, res, next) => {
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

    // Check if classId is provided
    if (!classId) throw ({
      status: 400,
      error: 'Please provide a classId'
    })

    sudo = false
      // Check for Admin / SuperAdmin / Mentor. If true, they have sudo rights
    if (req.decoded.roles.indexOf('Admin') !== -1 || req.decoded.roles.indexOf('SuperAdmin') !== -1 || req.decoded.roles.indexOf('Mentor') !== -1) {
      sudo = true
    }
    // Check if the person editing the attendance actually belong to that class unless the user has sudo rights
    if (req.decoded.classes.indexOf(classId) == -1 && sudo == false) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    let hoursInt = parseInt(hours, 10)
      // If there is no class, everyone will get 0 hours
    if (type !== 'Class') hoursInt = 0

    let attendance1 = {
      date,
      hours: hoursInt,
      class: classId,
      users,
      students,
      type
    } // Find attendance based on class and date. If exist, updates; else creates a new one.

    const newAttendance = await Attendance.findOneAndUpdate({
      class: classId,
      date,
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
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else if (err.name == 'ValidationError') {
      res.status(400).send('There is something wrong with the client input. That is all we know.')
    } 
    else next(err)
  }
}

module.exports.deleteAttendance = async(req, res, next) => {
  try {
    let {
      date,
      classId
    } = req.body
      // Check if classId and date are provided
    if (!classId || !date) throw ({
      status: 400,
      error: 'Please provide both classId and date'
    })

    sudo = false
      // Check for Admin / SuperAdmin / Mentor. If true, they have sudo rights
    if (req.decoded.roles.indexOf('Admin') !== -1 || req.decoded.roles.indexOf('SuperAdmin') !== -1 || req.decoded.roles.indexOf('Mentor') !== -1) {
      sudo = true
    }
    // Prevent any non admin rights users to delete attendance of classes they do not belong to 
    if (req.decoded.classes.indexOf(classId) == -1 && sudo == false) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    // Remove it from database
    const removed = await Attendance.remove({
      class: classId,
      date,
    })

    res.json({
      status: 'success',
      removed
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}


module.exports.getAttendance = async(req, res, next) => {
  try {
    let {
      classId,
      dateStart,
      dateEnd
    } = req.params

    // Find attendance based on the filters of class, dateStart and dateEnd if provided.
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
    // else the query is empty and every single record from past till now is obtained, similar to a getAll function. Limit to 100 newest.

    const foundAttendances = await attendances.exec()

    res.json({
      status: 'success',
      foundAttendances
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getAttendanceByUser = async(req, res, next) => {
  try {
    let {
      userId,
      classId,
      dateStart,
      dateEnd
    } = req.params
    let user = {}

    // Prevent users from getting attendance of other users unless they are admin
    if (userId !== req.decoded._id && (req.decoded.roles.indexOf('Admin') == -1 || req.decoded.roles.indexOf('SuperAdmin') == -1)) throw ({
      status: 403,
      error: 'Your client does not have the permissions to access this function.'
    })

    // Init what factors to search in user later
    user['users.list'] = mongoose.Types.ObjectId(userId)
    user.date = {
      $gte: util.formatDate(dateStart),
      $lte: util.formatDate(dateEnd)
    }

    if (classId) {
      user.class = mongoose.Types.ObjectId(classId)
    }

    const attendances = await Attendance.aggregate()
      .match(user)
      .unwind('users') // Break the array of users into individual slots
      .match({
        'users.list': mongoose.Types.ObjectId(userId)
      }) // Out of the users, find those with the ID searched
      .lookup({
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class'
      }) // Populate the classId field
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$users.list',
        'userAttendance': {
          '$push': {
            'status': '$users.status',
            'date': '$date',
            'duration': '$hours',
            'classType': '$type',
            'className': '$class.className',
            'classId': '$class._id'
          }
        },
        'total': {
          '$sum': 1
        }, // Stats to show total number of 'Class'(es) held.
        'attended': {
          '$sum': '$users.status'
        }, // Stats to show total attended 
        'totalHours': {
          '$sum': {
            '$cond': [{
              '$eq': ["$users.status", 1]
              }, '$hours', 0]
          }
        } // Stats to show total hours volunteered in the chosen time period. Only counted if one attends the lesson
      })
      .project({
        'userAttendance': '$userAttendance',
        'total': '$total',
        'attended': '$attended',
        'totalHours': '$totalHours',
        'percentage': {
          $divide: ['$attended', '$total']
        }
      }) // Final command to filter stuff to show

    res.json({
      status: 'success',
      attendances,
    })
  }
  catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    }
    else next(err)
  }
}

module.exports.getAttendanceByStudent = async(req, res, next) => {
  try {
    let {
      studentId,
      classId,
      dateStart,
      dateEnd
    } = req.params
    let student = {}

    // Init what factors to search in student later
    student['students.list'] = mongoose.Types.ObjectId(studentId)
    student.date = {
      $gte: util.formatDate(dateStart),
      $lte: util.formatDate(dateEnd)
    }

    if (classId) {
      student.class = mongoose.Types.ObjectId(classId)
    }

    const attendances = await Attendance.aggregate()
      .match(student)
      .unwind('students') // Break the array of students into individual slots
      .match({
        'students.list': mongoose.Types.ObjectId(studentId)
      }) // Out of the students, find those with the ID searched
      .lookup({
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class'
      }) // Populate the classId field
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$students.list',
        'studentAttendance': {
          '$push': {
            'status': '$students.status',
            'date': '$date',
            'duration': '$hours',
            'classType': '$type',
            'className': '$class.className',
            'classId': '$class._id'
          }
        },
        'total': {
          '$sum': 1
        }, // Stats to show total number of 'Class'(es) held.
        'attended': {
          '$sum': '$students.status'
        }, // Stats to show total attended 
        'totalHours': {
          '$sum': {
            '$cond': [{
              '$eq': ["$students.status", 1]
              }, '$hours', 0]
          }
        } // Stats to show total hours volunteered in the chosen time period. Only counted if one attends the lesson
      })
      .project({
        'studentAttendance': '$studentAttendance',
        'total': '$total',
        'attended': '$attended',
        'totalHours': '$totalHours',
        'percentage': {
          $divide: ['$attended', '$total']
        }
      }) // Final command to filter stuff to show

    res.json({
      status: 'success',
      attendances
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getClassAttendanceSummary = async(req, res, next) => {
  try {
    let {
      classId
    } = req.params

    // Start aggregate function
    const foundAttendanceforUser = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      }) // Find a class with that ID
      .unwind('users') // Within each attendance, break array of users up into individual slots
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$users.list',
        'userAttendance': {
          '$push': {
            'status': '$users.status',
            'date': '$date',
            'type': '$type'
          }
        }, // Group the broke up users by similar ID, then display their status for each particular day of attendance
        'total': {
          '$sum': {
            '$cond': [{
              '$eq': ["$type", 'Class']
            }, 1, 0]
          }
        }, // Stats to show total number of 'Class'(es) held.
        'attended': {
          '$sum': '$users.status'
        } // Stats to show total attended
      })
      .lookup({
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userName'
      }) // Populate the UserID field
      .project({
        userName: '$userName.profile.name',
        userAttendance: '$userAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      }) // Display only relevant data

    // Bottom is a repeated function for students. Works the same, refer to Users
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
            'date': '$date',
            'type': '$type'
          }
        },
        'total': {
          '$sum': {
            '$cond': [{
              '$eq': ["$type", 'Class']
            }, 1, 0]
          }
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
        studentAttendance: '$studentAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      })

    // Get tutorStudentRatio
    let studentNumber = foundAttendanceforStudent.length
    let tutorNumber = foundAttendanceforUser.length
    let tutorStudentRatio = tutorNumber / studentNumber


    res.json({
      status: 'success',
      foundAttendanceforUser,
      foundAttendanceforStudent,
      tutorStudentRatio
    })
  }
  catch (err) {
    console.log(err)
    next(err)
  }
}
