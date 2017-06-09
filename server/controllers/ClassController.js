const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
const External = require('../models/external-personnel')
let util = require('../util.js')

// This is authenticated, user info stored in req.decoded
module.exports.addEditClass = async(req, res) => {
  try {
    let {
      className,
      description
    } = req.body
    className = util.makeString(className)
    const class1 = {
      className,
      description
    }
    const newClass = await Class.findOneAndUpdate({
      className
    }, class1, {
      upsert: true,
      new: true
    })

    res.json({
      status: 'success',
      class: newClass
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAll = async(req, res) => {
  try {
    const classes = await Class.find({}).select('-createdAt')
    return res.json({
      classes,
      info: req.decoded
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

module.exports.addStudentsToClass = async(req, res) => {
  try {
    let {
      classId,
      studentIds
    } = req.body
    classId = util.makeString(classId)
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        students: {
          $each: studentIds
        }
      }
    }, {
      new: true
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
    classId = util.makeString(classId)
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
    classId = util.makeString(classId)
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        users: {
          $each: userIds
        }
      }
    }, {
      new: true
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
    classId = util.makeString(req.body.classId)

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
    classId = util.makeString(classId)
    name = util.makeString(name)
    nric = util.makeString(nric)
    organisation = util.makeString(organisation)
    relationTo = util.makeString(relationTo)
    nameOfRelatedPersonnel = util.makeString(nameOfRelatedPersonnel)

    const externalPersonnel = await External.findOneAndUpdate(nric, {
      $addToSet: {
        classId
      },
      $set: {
        name,
        organisation,
        relationTo,
        nameOfRelatedPersonnel
      }
    }, {
      new: true,
      upsert: true
    })

    /*  const externalPersonnelInformation = new External({
        classId,
        name,
        nric,
        organisation,
        relationTo,
        nameOfRelatedPersonnel
      })
      const externalPersonnel = await externalPersonnelInformation.save()
        // Chose to just add name instead of id since it is for recording only */
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
    classId = util.makeString(classId)
    externalId = util.makeString(externalId)

    const updatedClass = await Class.findByIdAndUpdate(classId, {
      $pull: {
        externalPersonnel: externalId
      }
    }, {
      new: true
    })

    const updatedUser = await External.findByIdAndUpdate(externalId, {
      $pull: {
        classId
      }
    }, {
      new: true
    })

    res.json({
      updatedClass,
      updatedUser
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
