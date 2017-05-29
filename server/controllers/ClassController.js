const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')
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
      className: className,
      description: description
    }
    const newClass = await Class.findOneAndUpdate({
      className: className
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
    const classes = await Class.find({}).select('-createdAt');
    return res.json({
      classes: classes,
      info: req.decoded //This is quite useless
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
    const class1 = await Class.findById(classId).populate('students users', 'profile.name')
    return res.json(class1)
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.addStudentToClass = async(req, res) => {
  try {
    const classId = util.makeString(req.body.classId)
    const studentId = util.makeString(req.body.studentId)
      // consider adding customizable filtering
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        students: studentId
      }
    }, {
      new: true
    })

    const student = await Student.findByIdAndUpdate(studentId, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true
    })

    // Add each student to the class
    // AND
    // add the class to each student

    return res.json({
      class: classes,
      studentAdded: student
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteStudentFromClass = async(req, res) => {
  try {
    const classId = [util.makeString(req.body.classId)]
    const studentId = [util.makeString(req.body.studentId)]
    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        students: studentId
      }
    }, {
      new: true
    })

    const student = await User.findByIdAndUpdate(studentId, {
      $pullAll: {
        classes: classId
      }
    }, {
      new: true
    })


    return res.json({
      status: 'removed',
      class: classes,
      studentRemoved: student
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.addUserToClass = async(req, res) => {
  try {
    const classId = util.makeString(req.body.classId)
    const userId = util.makeString(req.body.userId)
    const classes = await Class.findByIdAndUpdate(classId, {
      $addToSet: {
        users: userId
      }
    }, {
      new: true
    })

    const user = await User.findByIdAndUpdate(userId, {
      $addToSet: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.json({
      class: classes,
      user: user
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }

}

module.exports.deleteUserFromClass = async(req, res) => {
  try {
    const classId = [util.makeString(req.body.classId)]
    const userId = [util.makeString(req.body.userId)]
    console.log(classId);
    const classes = await Class.findByIdAndUpdate(classId, {
      $pullAll: {
        users: userId
      }
    }, {
      new: true
    })

    const user = await User.findByIdAndUpdate(userId, {
      $pullAll: {
        classes: classId
      }
    }, {
      new: true
    })

    return res.json({
      class: classes,
      user: user
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
