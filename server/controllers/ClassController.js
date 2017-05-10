const Class = require('../models/class')
const Student = require('../models/student')
const User = require('../models/user')

function makeString(obj) {
  return (typeof(obj) == 'string') ? obj : JSON.stringify(obj);
}

// This is authenticated, user info stored in req.decoded
module.exports.addEditClass = async(req, res) => {
  try {
    let {
      className,
      description
    } = req.body
    var students = []
    var users = []
    className = makeString(className)
    const class1 = {
      className: className,
      description: description,
      students: students,
      tutors: users
    }
    const newClass = await Class.findOneAndUpdate({
      className: className
    }, class1, {
      upsert: true,
      new: true
    })

    console.log(newClass)
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

module.exports.getAll = function(req, res) {
  Class.find({}).then((err, classes) => {
    if (err) return res.send(err)
    return res.json({
      classes: classes,
      info: req.decoded
    })
  })
}
module.exports.getClassById = async(req, res) => {
  var classId = makeString(req.params.id)
  try {
    const class1 = await Class.findById(classId).populate('students', ['profile.name'])
    return res.json(class1)
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

function removeDups(arr) {
  var x,
    out = [],
    obj = {},
    l = arr.length
  for (x = 0; x < l; x++) {
    obj[arr[x]] = 0
  }
  for (x in obj) {
    out.push(x)
  }
  return out
}

module.exports.addStudentToClass = async(req, res) => {
  try {
    const classId = makeString(req.body.classId)
    const studentIc = makeString(req.body.icNumber)
      // consider adding customizable filtering
    const students = await Student.find({
      'profile.icNumber': studentIc
    })
    var class1 = await Class.findById(classId)

    // Add each student to the class
    // AND
    // add the class to each student
    for (var i = 0; i < students.length; i++) {
      class1.students.push(students[i])
      students[i].classes.push(class1)
      students[i].classes = removeDups(students[i].classes)
      students[i].save()
    }
    class1.students = removeDups(class1.students)

    class1.save()
    return res.json({
      class: class1,
      studentAdded: students
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.deleteStudentFromClass = async(req, res) => {
  try {
    const classId = makeString(req.body.classId)
    const studentIc = makeString(req.body.icNumber)
    const student = await Student.findOne({
      'profile.icNumber': studentIc
    })
    var class1 = await Class.findById(classId)

    let index = class1.students.indexOf(student._id)
      // if the student is not found in the class
    if (index == -1) {
      return res.status(422).send('student not found in the class')
    }
    // remove the student id from the array
    class1.students.splice(index, 1)
      // no need for checking if student has the class.
      // no other modifier of class and student refs.
    let classIndex = student.classes.indexOf(class1._id)
    student.classes.splice(classIndex, 1)

    student.save()
    class1.save()
    return res.json({
      status: 'removed',
      studentRemoved: student
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.addUserToClass = async(req, res) => {
  const classId = makeString(req.body.classId)
  const userId = makeString(req.body.userId)
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

module.exports.deleteUserFromClass = async(req, res) => {

  const classId = [makeString(req.body.classId)]
  const userId = [makeString(req.body.userId)]
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


module.exports.dropDB = function(req, res) {
  Class.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({
      removed: num
    })
  })
}
