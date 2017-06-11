const Student = require('../models/student')
let util = require('../util.js')

// This is authenticated, user info stored in req.decoded
module.exports.addEditStudent = async(req, res) => {
  try {
    Object.keys(req.body).forEach(function(k) {
      req.body[k] = util.makeString(req.body[k])
    })
    let {
      name,
      icNumber,
      contactNumber,
      dateOfBirth,
      address,
      gender,
      nationality,
      schoolName,
      schoolType,

      FatherName,
      FatherIcNumber,
      FatherEmail,
      FatherContactNumber,
      FatherNationality,
      FatherOccupation,
      FatherIncome,

      MotherName,
      MotherIcNumber,
      MotherEmail,
      MotherContactNumber,
      MotherNationality,
      MotherOccupation,
      MotherIncome,

      otherFamilyName,
      otherFamilyRelationship,
      otherFamilyAge,
      fas,
      tuition,
      interviewDate,
      interviewNotes,
      commencementDate,
      adminNotes,
      exitDate,
      exitReason,
      year,
      term,
      english,
      motherTongue,
      math,
      science,
      overall
    } = req.body

    let student = {
      profile: {
        name,
        icNumber,
        contactNumber,
        dateOfBirth,
        address,
        gender,
        nationality,
        schoolName,
        schoolType
      },
      father: {
        name: FatherName,
        icNumber: FatherIcNumber,
        email: FatherEmail,
        contactNumber: FatherContactNumber,
        nationality: FatherNationality,
        occupation: FatherOccupation,
        income: FatherIncome,
      },
      mother: {
        name: MotherName,
        icNumber: MotherIcNumber,
        email: MotherEmail,
        contactNumber: MotherContactNumber,
        nationality: MotherNationality,
        occupation: MotherOccupation,
        income: MotherIncome,
      },
      otherFamily: {
        name: otherFamilyName,
        relationship: otherFamilyRelationship,
        age: otherFamilyAge,
      },
      fas,
      tuition,
      admin: {
        interviewDate,
        interviewNotes,
        commencementDate,
        adminNotes,
        exitDate,
        exitReason,
      },
      academicInfo: {
        year,
        term,
        english,
        motherTongue,
        math,
        science,
        overall
      }
    }
    
    /* The bottom is ideal for parsing in JSON Objects, but will not work after makeString(). Other middleware to check is preferred
      
    let student = req.body
    
    assuming req.body has these objects of 
    profile, father, mother, etc..
    if req.body doesnt have them for any reason, they will be saved as null
      
    }
    */
    
    
    const newStudent = await Student.findOneAndUpdate({
      'profile.icNumber': icNumber
    }, student, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    })

    res.json({
      status: 'success',
      student: newStudent
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getAll = async(req, res) => {
  try {
    const students = await Student.find({})
    return res.json({
      students: students,
      info: req.decoded
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.getStudentById = async(req, res) => {
  try {
    const studentId = util.makeString(req.params.id)
    const student = await Student.findById(studentId).populate('classes', 'className')
    return res.json({
      student
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).send('server error')
  }
}

module.exports.dropDB = function(req, res) {
  Student.remove({}, (err, num) => {
    if (err) return res.status(500).send(err)
    return res.json({
      removed: num
    })
  })
}
