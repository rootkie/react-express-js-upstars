const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
const mongoose = require('mongoose')

// SuperAdmin
module.exports.addClass = async (req, res, next) => {
  try {
    const { className, classType, venue, dayAndTime, startDate } = req.body

    if (!className || className.length === 0) {
      const error = {
        status: 400,
        error: 'Please provide a class name'
      }
      throw error
    }
    // Check if the class already exist and prevent duplicate creation
    const classExist = await Class.findOne({
      className
    }).lean()

    if (classExist) {
      const error = {
        status: 409,
        error: 'Class already exist. Create a new class or edit a current class.'
      }
      throw error
    }

    // Create a new class
    const newClass = new Class({
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    })

    // Validate that all fields are filled in.
    const error = await newClass.validateSync()
    if (error) {
      const error = {
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      }
      throw error
    }
    const newClassCreated = await newClass.save()

    res.status(201).json({
      newClassId: newClassCreated._id
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// SuperAdmin
module.exports.cloneClass = async (req, res, next) => {
  const classId = req.params.id
  try {
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a proper classId'
      }
      throw error
    }
    const oldClassData = await Class.findById(classId)
    if (!oldClassData) {
      const error = {
        status: 404,
        error: 'Class not found, please try again'
      }
      throw error
    }
    // Creates a shallow copy while editing the fields
    const clonedClass = {
      ...oldClassData.toObject(),
      _id: mongoose.Types.ObjectId(),
      status: 'Active',
      className: oldClassData.className + ' Clone',
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const clone = new Class(clonedClass)
    const newClassData = await clone.save()

    res.status(201).json({
      newClassId: newClassData._id
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// SuperAdmin
module.exports.editClass = async (req, res, next) => {
  try {
    const { classId, className, classType, venue, dayAndTime, startDate, status } = req.body

    // Create a class instance using the newly provided fields
    const newClassData = {
      className,
      classType,
      venue,
      dayAndTime,
      startDate,
      status
    }
    // Find and update class
    const newClass = await Class.findByIdAndUpdate(classId, newClassData, {
      new: true,
      runValidators: true
    })

    // Check that class actually exist
    if (!newClass) {
      const error = {
        status: 404,
        error: 'Class not found. Please try again later'
      }
      throw error
    }

    res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.name === 'ValidationError') {
      res.status(400).send({error: 'Our server had issues validating your inputs. Please fill in using proper values'})
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Everyone
// Classes are either Stopped or Active
module.exports.getAll = async (req, res, next) => {
  try {
    const { classes, roles } = req.decoded
    // Find all classes
    const activeClasses = await Class.find({
      'status': 'Active'
    }).select('-createdAt -students -users -updatedAt -startDate -__v').limit(100).lean()
    const stoppedClasses = await Class.find({
      'status': 'Stopped'
    }).select('-createdAt -students -users -updatedAt -startDate -__v').limit(200).lean()
    // If they are not admin / superadmin, their view of classes is restricted to classes they belong in:
    if (roles.indexOf('SuperAdmin') === -1 && roles.indexOf('Admin') === -1) {
      const filteredActive = activeClasses.filter(el => classes.indexOf(el._id.toString()) !== -1)
      const filteredStop = stoppedClasses.filter(el => classes.indexOf(el._id.toString()) !== -1)
      return res.status(200).json({
        activeClasses: filteredActive,
        stoppedClasses: filteredStop
      })
    }
    return res.status(200).json({
      activeClasses,
      stoppedClasses
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

// Everyone
module.exports.getClassById = async (req, res, next) => {
  try {
    const classId = req.params.id

    // Check if classId is given
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }

    // Find a class and populate the students and users to get their name.
    const classData = await Class.findById(classId).populate('students users', 'name')
      // .select('-updatedAt -createdAt')
      .lean()
    // If class does not exist, throw an error
    if (!classData) {
      const error = {
        status: 404,
        error: 'This class does not exist'
      }
      throw error
    }
    return res.status(200).json({
      class: classData
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// SuperAdmin
module.exports.deleteClass = async (req, res, next) => {
  const { classId } = req.body
  try {
    // classId is an array, thus we test all of the IDs within that array
    if (!classId || classId.length === 0 || !classId.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please provide at least 1 classId and ensure all values are correct.'
      }
      throw error
    }

    // Remove class from database
    const classDeleted = await Class.updateMany({
      '_id': {
        '$in': classId
      },
      'status': {
        '$ne': 'Stopped'
      }
    }, {
      'status': 'Stopped'
    })
    if (classDeleted.n === 0) {
      return res.status(404).json({
        error: 'Class not found'
      })
    }
    return res.status(200).send()
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Admin / SA
module.exports.addStudentsToClass = async (req, res, next) => {
  const { classId, studentIds } = req.body
  try {
    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }
    if (!studentIds.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please ensure all studentId are correct'
      }
      throw error
    }

    // Update the class by adding those array of students into the class student field
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        students: {
          $each: studentIds
        }
      }
    }, {
      new: true,
      runValidators: true
    })
    if (!classes) {
      const error = {
        status: 404,
        error: 'Please provide an existing class'
      }
      throw error
    }
    // For every student in the array, add the class added into their class field
    const students = await Student.updateMany({
      _id: {
        $in: studentIds
      }
    }, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.status(200).json({
      class: classes,
      students
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Admin / SA
module.exports.deleteStudentsFromClass = async (req, res, next) => {
  const { classId, studentIds } = req.body
  try {
    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }
    if (!studentIds.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please ensure all studentId are correct'
      }
      throw error
    }

    // Delete students from the class's student field
    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        students: studentIds
      }
    }, {
      new: true
    })

    // Delete the class in student's class field
    const students = await Student.updateMany({
      _id: {
        $in: studentIds
      }
    }, {
      $pull: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.status(200).json({
      class: classes,
      studentsRemoved: students
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Admin / SA
module.exports.addUsersToClass = async (req, res, next) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }
    if (!userIds.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please ensure all userId are correct'
      }
      throw error
    }

    // Add users into class's lists of users
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        users: {
          $each: userIds
        }
      }
    }, {
      new: true,
      runValidators: true
    })

    // Add class into users' list of classes
    const users = await User.updateMany({
      _id: {
        $in: userIds
      }
    }, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.status(200).json({
      class: classes,
      users
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Admin / SA
module.exports.deleteUsersFromClass = async (req, res, next) => {
  const { classId, userIds } = req.body
  try {
    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      const error = {
        status: 400,
        error: 'Please provide a classId'
      }
      throw error
    }
    if (!userIds.every(id => (/^[0-9a-fA-F]{24}$/).test(id))) {
      const error = {
        status: 400,
        error: 'Please ensure all userId are correct'
      }
      throw error
    }

    // Delete users from class's list of users
    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        users: userIds
      }
    }, {
      new: true
    })

    // Delete class from users' list of classes
    const users = await User.updateMany({
      _id: {
        $in: userIds
      }
    }, {
      $pull: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.status(200).json({
      class: classes,
      users
    })
  } catch (err) {
    console.error(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}
