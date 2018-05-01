const Attendance = require('../models/attendance')
const Class = require('../models/class')
let mongoose = require('mongoose')
let moment = require('moment')
let util = require('../util')

// All attendances are accessible by everyone including tutor. A second round of checking is done within the function as well as the front-end
module.exports.addEditAttendance = async (req, res, next) => {
  try {
    let {
      date,
      hours,
      classId,
      users,
      students,
      type
    } = req.body

    // Check if classId is provided
    if (!classId) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
    }
    let approved = await util.checkClass({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: classId,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    let hoursInt = parseInt(hours, 10)
    // If there is no class, everyone will get 0 hours
    if (type !== 'Class') hoursInt = 0
    //  Delcare a new attendance object
    let attendance1 = {
      date,
      hours: hoursInt,
      class: classId,
      users,
      students,
      type
    }
    // Find attendance based on class and date. If exist, updates; else creates a new one.
    const newAttendance = await Attendance.findOneAndUpdate({
      class: classId,
      date
    }, attendance1, {
      upsert: true,
      new: true,
      runValidators: true
    })

    res.status(200).json({
      status: 'success',
      attendance: newAttendance
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else if (err.name === 'ValidationError') {
      res.status(400).send({
        error: 'There is something wrong with the client input. That is all we know.'
      })
    } else next(err)
  }
}

module.exports.deleteAttendance = async (req, res, next) => {
  try {
    let {
      attendanceId,
      classId
    } = req.body
    // Check if classId and date are provided
    if (!attendanceId || !classId) {
      throw ({
        status: 400,
        error: 'Please provide at least 1 attendanceId, classId and ensure input is correct'
      })
    }

    let approved = await util.checkClass({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: classId,
      decoded: req.decoded
    })
    // Check if user has admin rights and is only querying their own particulars
    if (approved === false) {
      throw ({
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      })
    }

    // Remove it from database
    const removed = await Attendance.remove({
      '_id': {
        '$in': attendanceId
      }
    })

    res.status(200).json({
      status: 'success',
      removed
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getAttendance = async (req, res, next) => {
  try {
    let {
      classId,
      dateStart,
      dateEnd
    } = req.params

    // Find attendance based on the filters of class, dateStart and dateEnd if provided.
    let attendances = Attendance.find()
      .limit(150)
      .populate('class', ['className'])
      .sort('class.className -date')

    if (classId) {
      attendances = attendances.where('class').equals(classId)
    }
    // Added the utc option to make the date earlier so comparison is valid
    if (dateStart) {
      attendances = attendances.where('date').gte(new Date(moment(dateStart).utc().format('YYYY-MM-DD')))
    }
    if (dateEnd) {
      attendances = attendances.where('date').lte(new Date(moment(dateEnd).format('YYYY-MM-DD')))
    }
    // else the query is empty and every single record from past till now is obtained, similar to a getAll function. Limit to 100 newest.

    const foundAttendances = await attendances.exec()

    res.status(200).json({
      status: 'success',
      foundAttendances
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getAttendanceById = async (req, res, next) => {
  try {
    let attendanceId = req.params.id

    const attendances = await Attendance.findById(attendanceId)
      .populate('class', ['className'])
      .populate('students.list users.list', 'profile.name')
    return res.status(200).json({
      attendances
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getAttendanceByUser = async (req, res, next) => {
  try {
    let {
      userId,
      classId,
      dateStart,
      dateEnd
    } = req.params
    let user = {}

    // Init what factors to search in user later
    user['users.list'] = mongoose.Types.ObjectId(userId)
    user.date = {
      $gte: new Date(moment(dateStart).format('YYYY-MM-DD')),
      $lte: new Date(moment(dateEnd).format('YYYY-MM-DD'))
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
              '$eq': ['$users.status', 1]
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

    res.status(200).json({
      status: 'success',
      attendances
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getAttendanceByStudent = async (req, res, next) => {
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
      $gte: new Date(moment(dateStart).format('YYYY-MM-DD')),
      $lte: new Date(moment(dateEnd).format('YYYY-MM-DD'))
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
              '$eq': ['$students.status', 1]
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

    res.status(200).json({
      status: 'success',
      attendances
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getClassAttendanceSummary = async (req, res, next) => {
  try {
    let {
      classId
    } = req.params

    // Start aggregate function
    const foundAttendanceforUser = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      }) // Find a class with that ID
      .project('-updatedAt -createdAt -__v') // Only show relevant fields so that the unwind process is faster
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
        }, // Group the 'broke up' users by similar ID, then display their status for each particular day of attendance
        'total': {
          '$sum': {
            '$cond': [{
              '$eq': ['$type', 'Class']
            }, 1, 0]
          }
        }, // Stats to show total number of 'Class'(es) held. Only those that are not PHoliday or Cancelled are counted
        'attended': {
          '$sum': '$users.status'
        } // Stats to show total attended by adding status numbers 1 or 0
      })
      .lookup({
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userName'
      }) // Populate the UserID field (search DB to find their name)
      .project({
        userName: '$userName.profile.name',
        userAttendance: '$userAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      }) // Display only relevant data to be carried to the next step to be processed.

    // Bottom is a repeated function for students. Works the same, refer to Users
    const foundAttendanceforStudent = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      })
      .project('-updatedAt -createdAt -__v')
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
              '$eq': ['$type', 'Class']
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

    // Get studentTutorRatio
    let studentNumber = foundAttendanceforStudent.length
    let tutorNumber = foundAttendanceforUser.length
    let studentTutorRatio = studentNumber / tutorNumber
    // Check if they are actually a number or is acually finate. This is because 2 / 0 = NaN. 0 / 0 = Infinity
    if (isNaN(studentTutorRatio) || !isFinite(studentTutorRatio)) {
      studentTutorRatio = 0
    }

    // Part 2: This parts compiles the raw data into actual displable format so that front end does not need to do the work,
    // which may lag up the browser for a slow or old computer
    // Find all the attendance dates and sort by date from oldest to newest (left to right display in front-end)
    // The following process belows retrieve all the dates which the class held. So, even removed students / users that has past attendance records
    // would be displayed in the class summary and new users who joined later would also be present in the summary sorted evenly.
    let attendanceDates = await Attendance.find({
      class: classId
    }).select('date type').sort('date')

    // This part considers the student, the bottom one is for users respectively, both serving the same purpose.
    // First we take the raw attendance from aggregate above and map it to get each individual student's compiled attendance.
    // Then we map all the dates retrieved from attendanceDates above. We cross check with all the dates that that student has attendance
    // records with and return its array position (variable pos). Using this info, we return the status of that student for that date.
    // This way, every student will get back an array like this: "details": [ 1, 1, 1, 0, - , -]
    // This means that there are a total of 6 classes held by the class. The student attended the first 3, absent on 4th and removed from class
    // before the 5th class. As such, all student / users have the same array length that corrosponds directly to the dates.
    let compiledStudentAttendance = foundAttendanceforStudent.map(student => {
      let details = attendanceDates.map(date => {
        let pos = student.studentAttendance.findIndex(info => info.date.getTime() === date.date.getTime())
        // Dash (-) is used when the student does not even have an attendance record at that date, means attendance taken before join / after leaving.
        let status = pos !== -1 ? student.studentAttendance[pos].status : '-'
        return status
      })
      // Here we return more info of the student ID, name, percentage attended and stuff including the array of status that is calculated above (details)
      return {
        studentID: student._id,
        studentName: student.studentName,
        total: student.total,
        attended: student.attended,
        percentage: student.percentage,
        details
      }
    })

    let compiledUserAttendance = foundAttendanceforUser.map(user => {
      let details = attendanceDates.map(date => {
        let pos = user.userAttendance.findIndex(info => info.date.getTime() === date.date.getTime())
        let status = pos !== -1 ? user.userAttendance[pos].status : '-'
        return status
      })
      return {
        userID: user._id,
        userName: user.userName,
        total: user.total,
        attended: user.attended,
        percentage: user.percentage,
        details
      }
    })
    // Returns necessary stuff like the dates and the corrosponding edited student and user particulars according to the docs.
    res.status(200).json({
      status: 'success',
      studentNumber,
      tutorNumber,
      studentTutorRatio,
      compiledStudentAttendance,
      compiledUserAttendance,
      attendanceDates
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getAllClassAttendanceSummary = async (req, res, next) => {
  try {
    const studentsPart = await Attendance.aggregate()
      // Only classes that are not having the status of PHol or Cancelled are counted.
      .match({
        'type': 'Class'
      })
      // In this case, we only leave the students and class fields so that the unwind process can take place faster especially with
      // a large database of 200+ people. Since the unwind process has a max limit of 100MB of RAM unless otherwise.
      .project({
        'students': 1,
        'class': 1
      })
      // The unwind process simply splits the document and duplicates it for each studentID
      .unwind('students')
      // Group the different attendance of different students by class, while calculating the number of students involved and their respective
      // attendance status. This allows for the percentage to be calculated.
      .group({
        '_id': '$class',
        'total': {
          '$sum': 1
        },
        'attended': {
          '$sum': '$students.status'
        }
      })
      // Filter results to show only the classID and the percentage of students in THAT class
      .project({
        'percentage': {
          '$divide': ['$attended', '$total']
        }
      })

    // The users part follows a similar logic.
    const usersPart = await Attendance.aggregate()
      .match({
        'type': 'Class'
      })
      .project({
        'users': 1,
        'class': 1
      })
      .unwind('users')
      .group({
        '_id': '$class',
        'total': {
          '$sum': 1
        },
        'attended': {
          '$sum': '$users.status'
        }
      })
      .project({
        'percentage': {
          '$divide': ['$attended', '$total']
        }
      })

    // Calls another API to get all classes that are currently Active and filter the output to only relevant ones.
    let activeClasses = await Class.find({
      'status': 'Active'
    }).select('className classType dayAndTime students users')

    // This process generates the JSON in the way the most ideal for displaying on the front-end.
    // The classes array is mapped, using the classID, search for the ID from the previously created students (studentsPart) and users (usersPart) array.
    let editedActiveClass = await activeClasses.map((classInfo) => {
      let details = {}
      // This simply means findIndex(function(x) { return x === classInfo._id }) but we use .equals() since we are comparing an object instead of string.
      let userPos = usersPart.findIndex(info => info._id.equals(classInfo._id))
      let studentPos = studentsPart.findIndex(info => info._id.equals(classInfo._id))
      // STRatio is simply student-tutor ratio.
      let STRatio = classInfo.students.length / classInfo.users.length
      if (isNaN(STRatio) || !isFinite(STRatio)) {
        STRatio = 0
      }
      // Configure the necessary details.
      details = {
        userNumber: classInfo.users.length,
        studentNumber: classInfo.students.length,
        className: classInfo.className,
        dayAndTime: classInfo.dayAndTime,
        id: classInfo._id,
        STRatio
      }
      // Check whether the ID from the class actually has attendance compiled previously and pair them up to get the attendance percentage.
      if (userPos !== -1) {
        details.usersPercentage = usersPart[userPos].percentage
      } else {
        details.usersPercentage = 0
      }
      if (studentPos !== -1) {
        details.studentsPercentage = studentsPart[studentPos].percentage
      } else {
        details.studentsPercentage = 0
      }
      return details
    })

    res.status(200).json({
      editedActiveClass
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}
