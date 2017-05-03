const Class = require('../models/class')

// This is authenticated, user info stored in req.decoded

module.exports.addClass = function (req, res) {
  Class.findOne({ className: req.body.className }, function (err, existingClass) {
    if (err) {
      return res.status(500).send('server error, class insert')
    }
    if (existingClass) {
      return res.status(422).send('Classname already exists')
    }
    let students = req.body.students.split(',')
    let class1 = new Class({
      className: req.body.className,
      description: req.body.description,
      students: students
    })

    class1.save((err, newClass) => {
      if (err) {
        console.log(err.message)
        return res.status(500).send('server error, class save')
      }
      return res.json({
        status: 'Class created',
        class: newClass
      })
    })
  })
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
