const classControl = require('./controllers/ClassController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')
const attendanceControl = require('./controllers/AttendanceController')
const statisticsControl = require('./controllers/StatisticsController')
const hasRole = require('./routeMiddleware').hasRole
// ==============Serving api======================
// only takes in x-www-form-urlencoded in req

module.exports = function (app) {
  app.get('/api/admin/getClasses', hasRole(['Tutor', 'Admin']), classControl.getAll)
  app.get('/api/getClass/:id', classControl.getClassById)
  app.post('/api/addEditClass', classControl.addEditClass)

  // POC for refs
  // Classes
  app.post('/api/addStudentToClass', classControl.addStudentToClass)
  app.post('/api/deleteStudentFromClass', classControl.deleteStudentFromClass)
  app.post('/api/addUserToClass', classControl.addUserToClass) // Handles both user -> class && class -> user
  app.post('/api/deleteUserFromClass', classControl.deleteUserFromClass)

  app.get('/api/getStudents', studentControl.getAll)
  app.get('/api/getStudent/:id', studentControl.getStudentById)
  app.post('/api/addEditStudent', studentControl.addEditStudent)

  // Attendance controls
  app.post('/api/addEditAttendance', attendanceControl.addEditAttendance)
  app.post('/api/deleteAttendance', attendanceControl.deleteAttendance)
  app.post('/api/getAttendanceBetween', attendanceControl.getAttendanceBetween)
  app.get('/api/getAttendanceByClass/:classId', attendanceControl.getAttendanceByClass)
  app.get('/api/getAttendanceByUser/:userId', attendanceControl.getAttendanceByUser)
  app.get('/api/getAttendanceByStudent/:studentId', attendanceControl.getAttendanceByStudent)
  app.post('/api/getAttendanceUserFromClass', attendanceControl.getAttendanceUserFromClass)

  // CIP hours record
  app.get('/api/getCipRecords/user/:userId', statisticsControl.getCipUser)

  // Statistics controls
  app.get('/api/getCipRecords/user/:userId', statisticsControl.getCipUser)
  app.post('/api/getAttendanceRate/user', statisticsControl.getAttendanceRateUser)
  app.post('/api/getAttendanceRate/student', statisticsControl.getAttendanceRateStudent)
  app.post('/api/admin/getClassSummary', statisticsControl.getClassSummary)

  // app.get('/api/admin/getClasses', classControl.getAll)
  // app.get('/api/admin/getClass/:id', classControl.getClassById)
  // app.post('/api/admin/addEditClass', classControl.addEditClass)

  // // POC for refs
  // app.get('/api/admin/addStudentToClass', classControl.addStudentToClass)

  // app.get('/api/admin/getStudents', studentControl.getAll)
  // app.get('/api/admin/getStudent/:id', studentControl.getStudentById)
  // app.post('/api/admin/addEditStudent', studentControl.addEditStudent)

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
}
