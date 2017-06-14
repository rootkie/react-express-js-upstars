const classControl = require('./controllers/ClassController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')
const attendanceControl = require('./controllers/AttendanceController')
const statisticsControl = require('./controllers/StatisticsController')
const userControl = require('./controllers/UserController.js')
const hasRole = require('./routeMiddleware').hasRole

// ==============Serving api======================
// only takes in x-www-form-urlencoded in req

module.exports = app => {
  app.get('/api/admin/getClasses', hasRole(['Tutor', 'Admin']), classControl.getAll)
  
  // Classes
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
  app.post('/api/getAttendanceBetween', attendanceControl.getAttendanceBetween)
  app.get('/api/getAttendanceByClass/:classId', attendanceControl.getAttendanceByClass)
  app.post('/api/getAttendanceByUser', attendanceControl.getAttendanceByUser)
  app.post('/api/getAttendanceByStudent', attendanceControl.getAttendanceByStudent)
  // app.post('/api/getAttendanceUserFromClass', attendanceControl.getAttendanceUserFromClass)
  // app.post('/api/getAttendanceStudentFromClass', attendanceControl.getAttendanceStudentFromClass)

  // CIP hours record
  app.get('/api/getCipRecords/user/:userId', statisticsControl.getCipUser)

  // Statistics controls
  app.get('/api/getCipRecords/user/:userId', statisticsControl.getCipUser)
  app.post('/api/getAttendanceRate/user', statisticsControl.getAttendanceRateUser)
  app.post('/api/getAttendanceRate/student', statisticsControl.getAttendanceRateStudent)
  app.post('/api/admin/getClassSummary', statisticsControl.getClassSummary)

  // User controls for any user
  app.get('/api/getAllUsers', userControl.getAllUsers)
  app.get('/api/getUser/:id', userControl.getUser)
  app.post('/api/editUserParticulars', userControl.editUserParticulars)
  app.post('/api/changePassword', userControl.changePassword) // For Users to change their own password
  
  app.get('/api/getExternal/:id', userControl.getExternal)

  // Admin controls under user
  app.post('/api/adminChangePassword', userControl.adminChangePassword) // For admin to change anyone's password
  app.post('/api/changeUserStatusAndPermissions', userControl.changeUserStatusAndPermissions) // If there's a need to split them up into 2 API... Waiting for the permissions table.

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
}
