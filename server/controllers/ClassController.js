const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
const External = require('../models/external-personnel')
let util = require('../util.js')

module.exports.addClass = async(req, res) => {
  try {
    let {
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    } = req.body

    const newClass = new Class({
      className,
      classType,
      venue,
      dayAndTime,
      startDate: util.formatDate(startDate)
    })
    const error = await newClass.validateSync();
    if (error) {
      return res.status(422).send('Error Saving: Fill in all required fields accurately')
    }
    const newClassCreated = await newClass.save()

    res.json({
      status: 'success',
      class: newClassCreated
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.editClass = async(req, res) => {
  try {
    let {
      classId,
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    } = req.body
    const class1 = {
      className,
      classType,
      venue,
      dayAndTime,
      startDate: util.formatDate(startDate)
    }

    const newClass = await Class.findByIdAndUpdate(classId, class1, {
      new: true,
      runValidators: true
    })

    res.json({
      status: 'success',
      class: newClass
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

module.exports.getAll = async(req, res) => {
  try {
    const classes = await Class.find({}).select('-createdAt')
    return res.json({
      classes
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
module.exports.getClassById = async(req, res) => {
  var classId = util.makeString(req.params.id)
  try {
    const class1 = await Class.findById(classId).populate('students users', 'profile.name').populate('externalPersonnel', 'name')
    return res.json(class1)
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteClass = async(req, res) => {
  return res.json({
    status: 'success'
  })
}

module.exports.addStudentsToClass = async(req, res) => {
  try {
    let {
      classId,
      studentIds
    } = req.body
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

    // Add each student to the class
    // AND
    // add the class to each student

    return res.json({
      class: classes,
      students
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteStudentsFromClass = async(req, res) => {
  try {
    // Special case in which studentsId must be an array and classId should be a single string
    let {
      classId,
      studentIds
    } = req.body
    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        students: studentIds
      }
    }, {
      new: true
    })

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

    return res.json({
      status: 'removed',
      class: classes,
      studentsRemoved: students
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.addUsersToClass = async(req, res) => {
  try {
    let {
      classId,
      userIds
    } = req.body
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

    return res.json({
      class: classes,
      users
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteUsersFromClass = async(req, res) => {
  try {
    let {
      classId,
      userIds
    } = req.body

    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        users: userIds
      }
    }, {
      new: true
    })

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

    return res.json({
      class: classes,
      users
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.assignExternalPersonnelToClass = async(req, res) => {
  try {
    let {
      classId,
      name,
      nric,
      organisation,
      relationTo,
      nameOfRelatedPersonnel
    } = req.body

    const externalPersonnel = await External.findOneAndUpdate({
      nric: nric
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

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        externalPersonnel: externalPersonnel._id
      }
    }, {
      new: true
    })
    res.json({
      externalPersonnel,
      updatedClass
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.removeExternalPersonnelFromClass = async(req, res) => {
  try {
    let {
      classId,
      externalId
    } = req.body

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: {
        externalPersonnel: externalId
      }
    }, {
      new: true
    })

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
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.dropDB = function(req, res) {
  Class.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({
      removed: num
    })
  })
}
