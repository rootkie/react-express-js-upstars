const classControl = require('./controllers/ClassController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')
const attendanceControl = require('./controllers/AttendanceController')
const statisticsControl = require('./controllers/StatisticsController')
const userControl = require('./controllers/UserController.js')
const adminControl = require('./controllers/AdminController.js')
const hasRole = require('./routeMiddleware').hasRole

// ==============Serving api======================
// only takes in x-www-form-urlencoded in req


module.exports = app => {
  // Classes
  app.get('/api/class', hasRole(['Tutor','Admin']), classControl.getAll)
  app.get('/api/class/:id', classControl.getClassById)
  app.post('/api/class', classControl.addClass)
  app.put('/api/class', classControl.editClass)
  app.delete('/api/class', classControl.deleteClass)

  // Students
  app.get('/api/students', studentControl.getAll)
  app.get('/api/students/:id', studentControl.getStudentById)
  app.post('/api/students', studentControl.addStudent)
  app.put('/api/students', studentControl.editStudentById)
  app.delete('/api/students', studentControl.deleteStudent)
  app.post('/api/students/class', classControl.addStudentsToClass)
  app.delete('/api/students/class', classControl.deleteStudentsFromClass)

  // Users
  app.get('/api/users', userControl.getAllUsers)
  app.get('/api/users/:id', hasRole(['Tutor', 'Admin']), userControl.getUser)
  app.post('/api/users', hasRole(['Tutor', 'Admin']), userControl.editUserParticulars)
  app.delete('/api/users', userControl.deleteUser)
  app.post('/api/users/changePassword', userControl.changePassword)
  app.post('/api/users/class', classControl.addUsersToClass)
  app.delete('/api/users/class', classControl.deleteUsersFromClass)

  // External
  app.get('/api/external/:id', userControl.getExternal)
  app.post('/api/external/class', classControl.assignExternalPersonnelToClass)
  app.delete('/api/external/class', classControl.removeExternalPersonnelFromClass)

  // Attendance controls
  app.post('/api/attendance', attendanceControl.addEditAttendance)
  app.delete('/api/attendance', attendanceControl.deleteAttendance)
  app.get('/api/attendance/class/:classId?/dateStart/:dateStart?/dateEnd/:dateEnd?', attendanceControl.getAttendance)
  app.get('/api/attendance/user/:userId/:dateStart-:dateEnd/:classId?', hasRole(['Tutor', 'Admin']), attendanceControl.getAttendanceByUser)
  app.get('/api/attendance/student/:studentId/:dateStart-:dateEnd/:classId?', attendanceControl.getAttendanceByStudent)
  app.get('/api/attendance/:classId/summary', attendanceControl.getClassAttendanceSummary) // Very VERBOSE

  // Statistics controls
  app.get('/api/stats/:classId/summary/:dateStart/:dateEnd', statisticsControl.getClassSummary) // Will remove soon

  // Admin controls under user
  app.post('/api/admin/user', adminControl.createUser) // Will make
  app.post('/api/admin/changePassword', adminControl.adminChangePassword)
  app.post('/api/admin/userStatusPermissions', adminControl.changeUserStatusAndPermissions)

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
  
  //Special Treats
  app.post('/api/generateAdminUser', adminControl.generateAdminUser)
}
