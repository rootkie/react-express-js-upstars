const Class = require('../models/class')

// This is authenticated, user info stored in req.decoded

module.exports.addEditClass = async (req, res) => {
  try {
    const { className, description } = req.body
    var students = req.body.students
    if(students) students=students.split(',')
    const class1 = {
      className: className,
      description: description,
      students:students
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
module.exports.getClassById = function (req, res) {
  var classId = req.params.id
  Class.findOne({
    _id: classId
  }, (err, class1) => {
    if (err) {
      console.log(err)
      return res.status(500).send('Database controller errors')
    }
    return res.json(class1)
  })
}

module.exports.dropDB = function (req, res) {
  Class.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({removed: num})
  })
}
