const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
const External = require('../models/external-personnel')
const util = require('../util')

module.exports.addClass = async(req, res, next) => {
  try {
    let {
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    } = req.body

    // Check if the class already exist and prevent duplicate creation
    const classExist = await Class.findOne({
      className,
      startDate
    })

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

module.exports.editClass = async(req, res, next) => {
  try {
    let {
      classId,
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    } = req.body

    // Create a class instance
    const class1 = {
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    }
      // Find and update class
    const newClass = await Class.findByIdAndUpdate(classId, class1, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      editedClass: newClass
    })
  } catch (err) {
    console.log(err)
    if (err.name === 'ValidationError') {
      res.status(400).send('Our server had issues validating your inputs. Please fill in using proper values')
    } else if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else next(err)
  }
}

module.exports.getAll = async(req, res, next) => {
  try {
    // Find all classes
    const classes = await Class.find({}).select('-createdAt')
    return res.status(200).json({
      classes
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.getClassById = async(req, res, next) => {
  try {
    let classId = req.params.id

    // Check if classId is given
    if (!classId) {
      throw ({
        status: 400,
        error: 'Please provide a classId'
      })
    }
    let approved = await util.checkClass({
      roles: ['Admin', 'SuperAdmin'],
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

    // Find a class and populate the students, users and external people to get their name
    const class1 = await Class.findById(classId).populate('students users', 'profile.name').populate('externalPersonnel', 'name')
    return res.status(200).json({
      class: class1
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

module.exports.deleteClass = async(req, res, next) => {
  let {
    classId
  } = req.body
  try {
    if (!classId || classId.indexOf('') !== -1) {
      throw ({
        status: 400,
        error: 'Please provide at least 1 classId and ensure input is correct.'
      })
    }

    // Remove class from database
    const classDeleted = await Class.remove({
      '_id': {
        '$in': classId
      }
    })
    return res.status(200).json({
      classDeleted
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

module.exports.addStudentsToClass = async(req, res, next) => {
  try {
    let {
      classId,
      studentIds // Should be an array
    } = req.body

    // Check that classId exist
    if (!classId) {
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

module.exports.deleteStudentsFromClass = async(req, res, next) => {
  try {
    let {
      classId,
      studentIds // Should be an array
    } = req.body

    // Check that classId exist
    if (!classId) {
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

module.exports.addUsersToClass = async(req, res, next) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    // Check that classId exist
    if (!classId) {
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

module.exports.deleteUsersFromClass = async(req, res, next) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    // Check that classId exist
    if (!classId) {
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

module.exports.assignExternalPersonnelToClass = async(req, res, next) => {
  try {
    let {
      classId,
      name,
      nric,
      organisation,
      relationTo,
      nameOfRelatedPersonnel
    } = req.body

    // Check that nric exist
    if (!nric) {
      throw ({
        status: 400,
        error: 'Please provide an nric'
      })
    }

    // Find from database. If exist, update; else create.
    const externalPersonnel = await External.findOneAndUpdate({
      nric
    }, {
      $addToSet: {
        classId
      },
      $set: {
        nric,
        name,
        organisation,
        relationTo,
        nameOfRelatedPersonnel
      }
    }, {
      new: true,
      upsert: true,
      runValidators: true
    })

    // Add external into class's list of externals
    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        externalPersonnel: externalPersonnel._id
      }
    }, {
      new: true
    })
    res.status(201).json({
      externalPersonnel,
      updatedClass
    })
  } catch (err) {
    console.log(err)
    if (err.status) {
      res.status(err.status).send({
        error: err.error
      })
    } else if (err.name == 'ValidationError') {
      res.status(400).send({
        error: 'There is something wrong with the client input. That is all we know.'
      })
    } else next(err)
  }
}

module.exports.removeExternalPersonnelFromClass = async(req, res, next) => {
  try {
    let {
      classId,
      externalId
    } = req.body

    // Check that externalId and classId provided
    if (!externalId || !classId) {
      throw ({
        status: 400,
        error: 'Please provide both externalId and class'
      })
    }

    // Remove external from a class's list of externals
    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: {
        externalPersonnel: externalId
      }
    }, {
      new: true
    })

    // Remove class from an external's list of classes
    const updatedExternal = await External.findByIdAndUpdate(externalId, {
      $pull: {
        classId
      }
    }, {
      new: true
    })

    res.json({
      updatedClass,
      updatedExternal
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
