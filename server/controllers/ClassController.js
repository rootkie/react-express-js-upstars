const Class = require('../models/class')
const Student = require('../models/student')
// This is authenticated, user info stored in req.decoded

module.exports.addEditClass = async (req, res) => {
  try {
    const { className, description } = req.body
    var students = []
    const class1 = {
      className: className,
      description: description,
      students: students
    }
    const newClass = await Class.findOneAndUpdate({ className: className}, class1, {upsert: true, new: true})

    console.log(newClass)
    res.json({
      status: 'success',
      class: newClass
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAll = function (req, res) {
  Class.find({}).then((err, classes) => {
    if (err) return res.send(err)
    return res.json({classes: classes, info: req.decoded})
  })
}
module.exports.getClassById = async (req, res) => {
  var classId = req.params.id
  try {
    class1 = await Class.findById(classId)
    return res.json(class1)
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

function removeDups (arr) {
  var x,
    out = [],
    obj = {}

  for (x = 0; x < arr.length; x++) {
    obj[arr[x]] = 0
  }
  for (x in obj) {
    out.push(x)
  }
  return out
}

// ===========temp===========
module.exports.addStudentToClass = async (req, res) => {
  try {
    // const student1 = await Student.findById('590af704c4f7e423a15528df')
    const students = await Student.find({schoolType: 'Primary'})
    var class1 = await Class.findById('590f2bd0d561f5261220b882')

    for (var i = 0; i < students.length; i++) {
      class1.students.push(students[i])
    }
    class1.students = removeDups(class1.students)
    class1.save()
    return res.json({
      class: class1,
      students: students
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

// ============end temp======

module.exports.dropDB = function (req, res) {
  Class.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({removed: num})
  })
}
