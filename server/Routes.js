const classControl = require('./controllers/ClassController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')
const attendanceControl = require('./controllers/AttendanceController')
const userControl = require('./controllers/UserController.js')
const adminControl = require('./controllers/AdminController.js')
const statisticsControl = require('./controllers/statisticsController')
const hasRole = require('./routeMiddleware').hasRole

// ==============Serving api======================
// only takes in x-www-form-urlencoded in req

module.exports = app => {
  // Classes
  app.get('/api/class', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), classControl.getAll)
  app.get('/api/class/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), classControl.getClassById)
  app.get('/api/class/clone/:id', hasRole(['SuperAdmin']), classControl.cloneClass)
  app.post('/api/class', hasRole(['SuperAdmin']), classControl.addClass)
  app.put('/api/class', hasRole(['SuperAdmin']), classControl.editClass)
  // More like stopping a class
  app.delete('/api/class', hasRole(['SuperAdmin']), classControl.deleteClass)

  // Students
  app.get('/api/students', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getAll)
  app.get('/api/otherStudents', hasRole(['Admin', 'SuperAdmin']), studentControl.getOtherStudents)
  app.get('/api/students/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getStudentById)
  app.get('/api/studentsResponsive/:name', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getStudentByName)
  app.get('/api/otherStudentsResponsive/:name', hasRole(['Admin', 'SuperAdmin']), studentControl.getOtherStudentByName)
  app.post('/api/students', studentControl.addStudent)
  app.post('/api/admin/students', hasRole(['SuperAdmin']), studentControl.adminAddStudent)
  app.put('/api/students', hasRole(['Mentor', 'Admin', 'SuperAdmin']), studentControl.editStudentById)
  app.post('/api/students/class', hasRole(['Admin', 'SuperAdmin']), classControl.addStudentsToClass)
  app.delete('/api/students', hasRole(['SuperAdmin']), studentControl.deleteStudent)
  app.delete('/api/students/class', hasRole(['Admin', 'SuperAdmin']), classControl.deleteStudentsFromClass)

  // Users
  app.get('/api/users', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.getAllUsers)
  app.get('/api/users/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.getUser)
  app.get('/api/usersResponsive/:name', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.getUsersByName)
  app.post('/api/users', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.editUserParticulars)
  app.post('/api/users/changePassword', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.changePassword)
  app.post('/api/users/class', hasRole(['Admin', 'SuperAdmin']), classControl.addUsersToClass)
  app.delete('/api/users', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.deleteUser) //  Personal account deletion
  app.delete('/api/users/class', hasRole(['Admin', 'SuperAdmin']), classControl.deleteUsersFromClass)

  // Attendance controls
  app.get('/api/attendance/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceById)
  app.get('/api/attendance/class/:classId?/dateStart/:dateStart?/dateEnd/:dateEnd?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendance)
  app.get('/api/attendance/user/:userId/:dateStart-:dateEnd/:classId?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceByUser)
  app.get('/api/attendance/student/:studentId/:dateStart-:dateEnd/:classId?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceByStudent)
  app.get('/api/attendance/:classId/summary', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getClassAttendanceSummary) // Very VERBOSE
  app.get('/api/attendance/summary/all', hasRole(['Admin', 'SuperAdmin']), attendanceControl.getAllClassAttendanceSummary)
  app.post('/api/attendance', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.addEditAttendance)
  app.delete('/api/attendance', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.deleteAttendance)

  // Admin controls under user
  app.get('/api/admin/pendingUsers', hasRole(['SuperAdmin']), adminControl.getPendingUsers)
  app.get('/api/admin/suspended', hasRole(['SuperAdmin']), adminControl.getSuspendedPeople)
  app.get('/api/admin/deleted', hasRole(['SuperAdmin']), adminControl.getDeletedPeople)
  app.get('/api/admin/search/:name', hasRole(['SuperAdmin']), adminControl.responsiveSearch)
  app.post('/api/admin/userStatusPermissions', hasRole(['SuperAdmin']), adminControl.changeUserStatusAndPermissions)
  app.delete('/api/admin/user', hasRole(['SuperAdmin']), adminControl.multipleUserDelete) //  Admin Mass deletion

  // Routes that require no AUTH, usually used for the typical user who have no access to the dashboard
  app.get('/api/check', authControl.check) // This is for frontend to check validity of token.
  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
  app.post('/api/changepassword', authControl.changePassword)
  app.post('/api/resetpassword', authControl.resetPassword)
  app.post('/api/verifyEmail', authControl.verifyEmail)
  app.post('/api/refresh', authControl.refreshToken) // Getting refresh tokens if valid
  app.post('/api/link', authControl.newLink)

  // Statistics which require a token but not any special privilege
  app.get('/api/stats/dashboard', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), statisticsControl.getDashboardStats)
}
