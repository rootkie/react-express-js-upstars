const User = require('../models/user')
const Class = require('../models/class')
const Attendance = require('../models/attendance')
const Student = require('../models/student')
const moment = require('moment')

module.exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUserEstimate = await User.estimatedDocumentCount()
    // Checking for new user sign ups within a 30 day period
    const newUserJoined = await User.countDocuments({
      status: {
        '$nin': ['Deleted', 'PermaDeleted', 'Suspended']
      },
      createdAt: {
        '$gte': moment().subtract(30, 'days')
      }
    })

    const totalStudentEstimate = await Student.estimatedDocumentCount()
    const newStudentJoined = await Student.countDocuments({
      status: 'Active',
      createdAt: {
        '$gte': moment().subtract(30, 'days')
      }
    })

    // There are no new Class stats because classes usually last for a year
    const totalClassesEstimate = await Class.estimatedDocumentCount()

    const totalClassesHeldEstimate = await Attendance.estimatedDocumentCount()
    const newClassesHeld = await Attendance.countDocuments({
      type: 'Class',
      date: {
        '$gte': moment().subtract(30, 'days')
      }
    })

    res.status(200).json({
      totalUserEstimate,
      newUserJoined,
      totalClassesEstimate,
      totalClassesHeldEstimate,
      newClassesHeld,
      totalStudentEstimate,
      newStudentJoined
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}
