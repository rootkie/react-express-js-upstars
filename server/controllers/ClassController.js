const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
const mongoose = require('mongoose')

// SuperAdmin
module.exports.addClass = async (req, res, next) => {
  try {
    let {
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    } = req.body

    if (!className || className.length === 0) {
      throw ({
        status: 400,
        error: 'Please provide a className to search for'
      })
    }
    // Check if the class already exist and prevent duplicate creation
    const classExist = await Class.findOne({
      className
    }).lean()

    if (classExist) {
      throw ({
        status: 409,
        error: 'Class already exist. Create a new class or edit a current class.'
      })
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
      throw ({
        status: 400,
        error: 'There is something wrong with the client input. That is all we know.'
      })
    }
    const newClassCreated = await newClass.save()

    res.status(201).json({
      newClass: newClassCreated
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

// SuperAdmin
module.exports.cloneClass = async (req, res, next) => {
  const classId = req.params.id
  try {
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a proper classId'
      })
    }
    const oldClassData = await Class.findById(classId)
    if (!oldClassData) {
      throw({
        status: 404,
        error: 'Class not found, please try again'
      })
    }
    oldClassData._id = mongoose.Types.ObjectId()
    oldClassData.className = oldClassData.className + ' Clone'
    oldClassData.status = 'Active'
    oldClassData.startDate = new Date()
    oldClassData.createdAt = new Date()
    oldClassData.updatedAt = new Date()
    oldClassData.isNew = true
    const newClassData = await oldClassData.save()

    res.status(201).json({
      newClassId: newClassData._id
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

// SuperAdmin
module.exports.editClass = async (req, res, next) => {
  try {
    let {
      classId,
      className,
      classType,
      venue,
      dayAndTime,
      startDate,
      status
    } = req.body

    // Create a class instance
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
      throw ({
        status: 404,
        error: 'Class not found. Please try again later'
      })
    }

    res.status(200).send()
  } catch (err) {
    console.log(err)
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
// The special thing about classes is they can be either stopped or active.
module.exports.getAll = async (req, res, next) => {
  try {
    let { classes, roles } = req.decoded
    // Find all classes
    const activeClasses = await Class.find({
      'status': 'Active'
    }).select('-createdAt -students -users -updatedAt -startDate').limit(100).lean()
    const stoppedClasses = await Class.find({
      'status': 'Stopped'
    }).select('-createdAt -students -users -updatedAt -startDate').limit(200).lean()
    // If they are not admin / superadmin, their view of classes is restricted to classes they belong in:
    if (roles.indexOf('SuperAdmin') === -1 && roles.indexOf('Admin') === -1) {
      console.log(classes)
      let filteredActive = activeClasses.filter(el => classes.indexOf(el._id.toString()) !== -1)
      let filteredStop = stoppedClasses.filter(el => classes.indexOf(el._id.toString()) !== -1)
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
    console.log(err)
    next(err)
  }
}

// Everyone
module.exports.getClassById = async (req, res, next) => {
  try {
    let classId = req.params.id

    // Check if classId is given
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
    }

    // Find a class and populate the students, users to get their name. Using class1 because class is a reserved word
    const classData = await Class.findById(classId).populate('students users', 'profile.name')
      .select('-updatedAt -createdAt').lean()
    // If class does not exist, throw an error
    if (!classData) {
      throw ({
        status: 404,
        error: 'This class does not exist'
      })
    }
    return res.status(200).json({
      class: classData
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

// SuperAdmin
module.exports.deleteClass = async (req, res, next) => {
  let {
    classId
  } = req.body
  try {
    if (!classId || classId.length === 0 || !(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide at least 1 classId and ensure input is correct.'
      })
    }

    // Remove class from database
    const classDeleted = await Class.update({
      '_id': {
        '$in': classId
      },
      'status': {
        '$ne': 'Stopped'
      }
    }, {
      'status': 'Stopped'
    }, {
      multi: true
    })
    if (classDeleted.n === 0) {
      return res.status(404).json({
        error: 'Class not found'
      })
    }
    return res.status(200).send()
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

// Admin / SA
module.exports.addStudentsToClass = async (req, res, next) => {
  try {
    let {
      classId,
      studentIds // Should be an array
    } = req.body

    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
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
      throw ({
        status: 404,
        error: 'Please provide an existing class'
      })
    }
    // For every student in the array, add the class added into their class field
    const students = await Student.update({
      _id: {
        $in: studentIds
      }
    }, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true,
      multi: true
    })

    return res.status(200).json({
      class: classes,
      students
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

// Admin / SA
module.exports.deleteStudentsFromClass = async (req, res, next) => {
  try {
    let {
      classId,
      studentIds // Should be an array
    } = req.body

    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
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
    const students = await Student.update({
      _id: {
        $in: studentIds
      }
    }, {
      $pull: {
        classes: classId
      }
    }, {
      new: true,
      multi: true
    })

    return res.status(200).json({
      class: classes,
      studentsRemoved: students
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

// Admin / SA
module.exports.addUsersToClass = async (req, res, next) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
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
    const users = await User.update({
      _id: {
        $in: userIds
      }
    }, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true,
      multi: true
    })

    return res.status(200).json({
      class: classes,
      users
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

// Admin / SA
module.exports.deleteUsersFromClass = async (req, res, next) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    // Check that classId exist
    if (!(/^[0-9a-fA-F]{24}$/).test(classId)) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
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
    const users = await User.update({
      _id: {
        $in: userIds
      }
    }, {
      $pull: {
        classes: classId
      }
    }, {
      new: true,
      multi: true
    })

    return res.status(200).json({
      class: classes,
      users
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
