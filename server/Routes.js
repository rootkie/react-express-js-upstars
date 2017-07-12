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
  app.get('/api/getClasses', hasRole(['Tutor','Admin']), classControl.getAll)
  app.get('/api/getClass/:id', classControl.getClassById)
  app.post('/api/addEditClass', classControl.addEditClass)
  app.post('/api/addStudentsToClass', classControl.addStudentsToClass)
  app.post('/api/deleteStudentsFromClass', classControl.deleteStudentsFromClass)
  app.post('/api/addUsersToClass', classControl.addUsersToClass) // Handles both user -> class && class -> user
  app.post('/api/deleteUsersFromClass', classControl.deleteUsersFromClass)
  app.post('/api/assignExternalPersonnelToClass', classControl.assignExternalPersonnelToClass)
  app.post('/api/removeExternalPersonnelFromClass', classControl.removeExternalPersonnelFromClass)
  // Students
  app.get('/api/getStudents', studentControl.getAll)
  app.get('/api/getStudent/:id', studentControl.getStudentById)
  app.post('/api/addEditStudent', studentControl.addEditStudent)

  // Attendance controls
  app.post('/api/addEditAttendance', attendanceControl.addEditAttendance)

  app.post('/api/deleteAttendance', attendanceControl.deleteAttendance)
  app.post('/api/getAttendanceByClass', attendanceControl.getAttendanceByClass)
  app.post('/api/getAttendanceByUser', attendanceControl.getAttendanceByUser)
  app.post('/api/getAttendanceByStudent', attendanceControl.getAttendanceByStudent)
  app.post('/api/getClassAttendanceSummary', attendanceControl.getClassAttendanceSummary)

  // Statistics controls
  app.get('/api/getCipRecords/user/:userId', statisticsControl.getCipUser)
  app.post('/api/getAttendanceRate/user', statisticsControl.getAttendanceRateUser)
  app.post('/api/getAttendanceRate/student', statisticsControl.getAttendanceRateStudent)
  app.post('/api/admin/getClassSummary', statisticsControl.getClassSummary)

  // User controls
  app.get('/api/getAllUsers', userControl.getAllUsers)
  app.get('/api/getUser/:id', hasRole(['Tutor', 'Admin']), userControl.getUser)
  app.post('/api/editUserParticulars', hasRole(['Tutor', 'Admin']), userControl.editUserParticulars)
  app.post('/api/changePassword', userControl.changePassword) // For Users to change their own password
  
  app.get('/api/getExternal/:id', userControl.getExternal)

  // Admin controls under user
  app.post('/api/adminChangePassword', adminControl.adminChangePassword)
  app.post('/api/changeUserStatusAndPermissions', adminControl.changeUserStatusAndPermissions)

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
  
  //Special Treats
  app.post('/api/generateAdminUser', adminControl.generateAdminUser)
}
