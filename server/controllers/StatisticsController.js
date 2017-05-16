const Attendance = require('../models/attendance')
const util = require('../util')

module.exports.getCipUser = async (req, res) => {
  try {
    const userId = util.makeString(req.params.userId)
    let records = await Attendance.find({ tutors: userId }, {hours: 1})
    const size = records.length
    let sum = 0
    for (let i = 0; i < size; i++) {
      sum += records[i].hours
    }
    res.json({
      status: 'success',
      hours: sum
    })
  } catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}
