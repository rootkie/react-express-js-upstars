const Attendance = require('../models/attendance')
const Class = require('../models/class')
const mongoose = require('mongoose')
const moment = require('moment')
const util = require('../util')

// All attendances are accessible by everyone including tutor. A second round of checking is done within the function as well as the front-end
module.exports.addEditAttendance = async (req, res, next) => {
  const { date, hours, classId, users, students, type } = req.body
  try {
    let newAttendance
    // Check if classId is provided
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }
    const approved = await util.checkClass({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: classId,
      decoded: req.decoded
    })
    // Check if user has admin rights or is only querying their own particulars
    if (approved === false) {
      const error = {
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      }
      throw error
    }

    // If there is no class, everyone will get 0 hours
    const hoursInt = (type === 'Class' ? parseInt(hours, 10) : 0)
    //  Declare a new attendance object
    const newAttendanceObject = {
      date,
      hours: hoursInt,
      class: classId,
      users,
      students,
      type
    }

    const attendanceFound = await Attendance.findOne({
      class: classId,
      date
    })
    if (!attendanceFound) {
      // Save a new attendance
      const unsavedAttendance = new Attendance(newAttendanceObject)
      newAttendance = await unsavedAttendance.save()
    } else {
      // Else update the old attendance
      attendanceFound.set(newAttendanceObject)
      newAttendance = await attendanceFound.save()
    }
    res.status(201).json({
      attendanceId: newAttendance._id
    })
  } catch (err) {
    console.error(err)
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
  const { attendanceId, classId } = req.body
  try {
    // Check if classId and date are provided
    if (!attendanceId || !(/^[0-9a-fA-F]{24}$/).test(attendanceId)) {
      const error = {
        status: 400,
        error: 'Please provide an existing attendanceId'
      }
      throw error
    }
    if (!classId || !(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide an existing classId'
      }
      throw error
    }

    const approved = await util.checkClass({
      roles: ['Admin', 'SuperAdmin', 'Mentor'],
      params: classId,
      decoded: req.decoded
    })
    // Check if user has admin rights or is only querying their own particulars
    if (approved === false) {
      const error = {
        status: 403,
        error: 'Your client does not have the permissions to access this function.'
      }
      throw error
    }

    // Remove it from database
    await Attendance.deleteMany({
      '_id': {
        '$in': attendanceId
      }
    })

    res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getAttendance = async (req, res, next) => {
  const { classId, dateStart, dateEnd } = req.params
  try {
    // Find attendance based on the filters of class, dateStart and dateEnd if provided.
    let attendances = Attendance.find()
      .limit(200)
      .populate('class', ['className'])
      .select('-users -students -updatedAt -createdAt')
      .sort('class.className -date')
      .lean()

    if (classId) {
      attendances = attendances.where('class').equals(classId)
    }
    // Added the utc option to make the date earlier so comparison is valid
    if (dateStart) {
      attendances = attendances.where('date').gte(moment(dateStart, 'DDMMYYYY').utc().toDate())
    }
    if (dateEnd) {
      attendances = attendances.where('date').lte(moment(dateEnd, 'DDMMYYYY').toDate())
    }
    // else the query is empty and every single record from past till now is obtained, similar to a getAll function. Limit to 200 newest.

    const foundAttendances = await attendances.exec()

    res.status(200).json({
      foundAttendances
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getAttendanceById = async (req, res, next) => {
  const attendanceId = req.params.id
  try {
    const attendances = await Attendance.findById(attendanceId)
      .populate('class', ['className'])
      .populate('students.student users.user', 'name')
      .lean()

    return res.status(200).json({
      attendances
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getAttendanceByUser = async (req, res, next) => {
  const { userId, classId, dateStart, dateEnd } = req.params
  try {
    let user = {}
    // Init what factors to search in user later
    user['users.user'] = mongoose.Types.ObjectId(userId)
    user.date = {
      $gte: moment(dateStart, 'DDMMYYYY').utc().toDate(),
      $lte: moment(dateEnd, 'DDMMYYYY').toDate()
    }

    if (classId) {
      user.class = mongoose.Types.ObjectId(classId)
    }

    const attendances = await Attendance.aggregate()
      .match(user)
      .limit(100)
      .project('-updatedAt -createdAt -__v')
      .unwind('users') // Break the array of users into individual slots
      .match({
        'users.user': mongoose.Types.ObjectId(userId)
      }) // Out of the users, find those with the ID searched
      .lookup({
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class'
      }) // Populate the classId field
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$users.user',
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
      attendances
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getAttendanceByStudent = async (req, res, next) => {
  const { studentId, classId, dateStart, dateEnd } = req.params
  try {
    let student = {}
    // Init what factors to search in student later
    student['students.student'] = mongoose.Types.ObjectId(studentId)
    student.date = {
      $gte: moment(dateStart, 'DDMMYYYY').utc().toDate(),
      $lte: moment(dateEnd, 'DDMMYYYY').toDate()
    }

    if (classId) {
      student.class = mongoose.Types.ObjectId(classId)
    }

    const attendances = await Attendance.aggregate()
      .match(student)
      .limit(100)
      .project('-updatedAt -createdAt -__v')
      .unwind('students') // Break the array of students into individual slots
      .match({
        'students.student': mongoose.Types.ObjectId(studentId)
      }) // Out of the students, find those with the ID searched
      .lookup({
        from: 'classes',
        localField: 'class',
        foreignField: '_id',
        as: 'class'
      }) // Populate the classId field
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$students.student',
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
      attendances
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getClassAttendanceSummary = async (req, res, next) => {
  const { classId } = req.params
  try {
    // Start aggregate function
    const foundAttendanceforUser = await Attendance.aggregate()
      .match({
        'class': mongoose.Types.ObjectId(classId)
      }) // Find a class with that ID
      .limit(150) // 150 classes max / year. It is recommended that a class is recreated for every year.
      .project('-updatedAt -createdAt -__v') // Only show relevant fields so that the unwind process is faster
      .unwind('users') // Within each attendance, break array of users up into individual slots
      /*
        Example:
        {
          users: ['a', 'b'],
          class: ['classA']
        }
        will unwind into:
        {
          users: 'a',
          class: ['classA']
        }, {
          users: 'b',
          class: ['classA']
        }
      */
      .sort('-date') // Sort newest to oldest
      .group({
        '_id': '$users.user',
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
        userName: '$userName.name',
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
        '_id': '$students.student',
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
        studentName: '$studentName.name',
        studentAttendance: '$studentAttendance',
        total: '$total',
        attended: '$attended',
        percentage: {
          $divide: ['$attended', '$total']
        }
      })

    // Get studentTutorRatio
    const studentNumber = foundAttendanceforStudent.length
    const tutorNumber = foundAttendanceforUser.length
    let studentTutorRatio = studentNumber / tutorNumber
    // Check if they are actually a number or is acually finate. This is because 2 / 0 = NaN. 0 / 0 = Infinity
    if (isNaN(studentTutorRatio) || !isFinite(studentTutorRatio)) {
      studentTutorRatio = 0
    }

    /* Part 2: This parts compiles the raw data into actual displable format so that front end does not need to do the work,
       which may lag up the browser for a slow or old computer
       Find all the attendance dates and sort by date from oldest to newest (left to right display in front-end)
       The following process belows retrieve all the dates which the class held. So, even removed students / users that has past attendance records
       would be displayed in the class summary and new users who joined later would also be present in the summary sorted evenly.
    */
    const attendanceDates = await Attendance.find({
      class: classId
    }).select('date type').sort('date')

    /* This part concerns the student, the bottom one is for users respectively, both serving the same purpose.
       1. We take the raw attendance from aggregate above and map it to get each individual student's compiled attendance.
       2. We map all the dates retrieved from attendanceDates above. We cross check with all the dates that that student has attendance
       records with and return its array position (let pos). Using this info, we return the status of that student for that date.
       3. This way, every student will get back an array like this example: "details": [ 1, 1, 1, 0, - , -]
       4. This means that there are a total of 6 classes held by the class. The student attended the first 3, absent on 4th and removed from class
       on the 5th class. As such, all student / users have the same array length that corrosponds directly to the dates.
     */
    const compiledStudentAttendance = foundAttendanceforStudent.map(student => {
      const details = attendanceDates.map(date => {
        let pos = student.studentAttendance.findIndex(info => info.date.getTime() === date.date.getTime())
        let status = pos !== -1 ? student.studentAttendance[pos].status : '-'
        return status
      })
      // The old raw studentAttendance / userAttendance will be replaced by details which is the array of '1', '0' and '-'.
      return {
        studentID: student._id,
        studentName: student.studentName,
        total: student.total,
        attended: student.attended,
        percentage: student.percentage,
        details
      }
    })

    const compiledUserAttendance = foundAttendanceforUser.map(user => {
      const details = attendanceDates.map(date => {
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
    res.status(200).json({
      studentNumber,
      tutorNumber,
      studentTutorRatio,
      compiledStudentAttendance,
      compiledUserAttendance,
      attendanceDates
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.getAllClassAttendanceSummary = async (req, res, next) => {
  try {
    const studentsPart = await Attendance.aggregate()
      .match({
        'type': 'Class'
      })
      .project({
        'students': 1,
        'class': 1
      })
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
      // Filter results to show only the classID and the percentage of students' attendance
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
    const activeClasses = await Class.find({
      'status': 'Active'
    }).select('className classType dayAndTime students users').lean()

    /* The aggregate functions returns an array like this:
    [{
      '_id': classId1,
      'percentage: 88
    }, {
      'id': classId2,
      'percentage': 90
    }]
    So, we map the array of current active classes which is an array like this: ['classId1', 'classId2', 'classId3']
    classId1 will corrosponds to the 88% found in the aggregate above. Since classId3 have not held any classes,
    the percentage will default to 0.
    */

    const editedActiveClass = await activeClasses.map(classInfo => {
      const userPos = usersPart.findIndex(classInfoOfUsers => classInfoOfUsers._id.equals(classInfo._id))
      const studentPos = studentsPart.findIndex(classInfoOfStudents => classInfoOfStudents._id.equals(classInfo._id))
      // STRatio is student-tutor ratio.
      let STRatio = classInfo.students.length / classInfo.users.length
      if (isNaN(STRatio) || !isFinite(STRatio)) {
        STRatio = 0
      }
      let details = {
        userNumber: classInfo.users.length,
        studentNumber: classInfo.students.length,
        className: classInfo.className,
        dayAndTime: classInfo.dayAndTime,
        id: classInfo._id,
        STRatio
      }
      details.usersPercentage = userPos !== -1 ? usersPart[userPos].percentage : 0
      details.studentsPercentage = studentPos !== -1 ? studentsPart[studentPos].percentage : 0
      return details
    })

    res.status(200).json({
      editedActiveClass
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
