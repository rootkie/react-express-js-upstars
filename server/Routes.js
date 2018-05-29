const classControl = require('./controllers/ClassController')
const authControl = require('./controllers/AuthController')
const studentControl = require('./controllers/StudentController')
const attendanceControl = require('./controllers/AttendanceController')
const userControl = require('./controllers/UserController.js')
const adminControl = require('./controllers/AdminController.js')
const hasRole = require('./routeMiddleware').hasRole

// ==============Serving api======================
// only takes in x-www-form-urlencoded in req

module.exports = app => {
  // Classes
  app.get('/api/class', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), classControl.getAll)
  app.get('/api/class/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), classControl.getClassById)
  app.post('/api/class', hasRole(['SuperAdmin']), classControl.addClass)
  app.put('/api/class', hasRole(['SuperAdmin']), classControl.editClass)
  app.delete('/api/class', hasRole(['SuperAdmin']), classControl.deleteClass)

  // Students
  app.get('/api/students', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getAll)
  app.get('/api/otherStudents', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getOtherStudents)
  app.get('/api/students/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), studentControl.getStudentById)
  app.post('/api/students', studentControl.addStudent)
  app.put('/api/students', hasRole(['Mentor', 'Admin', 'SuperAdmin']), studentControl.editStudentById)
  app.delete('/api/students', hasRole(['SuperAdmin']), studentControl.deleteStudent)
  app.post('/api/students/class', hasRole(['Admin', 'SuperAdmin']), classControl.addStudentsToClass)
  app.delete('/api/students/class', hasRole(['Admin', 'SuperAdmin']), classControl.deleteStudentsFromClass)

  // Users
  app.get('/api/users', hasRole(['SuperVisor', 'Admin', 'SuperAdmin']), userControl.getAllUsers)
  app.get('/api/users/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.getUser)
  app.post('/api/users', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.editUserParticulars)
  app.delete('/api/users', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.deleteUser) //  Personal account deletion
  app.post('/api/users/changePassword', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), userControl.changePassword)
  app.post('/api/users/class', hasRole(['Admin', 'SuperAdmin']), classControl.addUsersToClass)
  app.delete('/api/users/class', hasRole(['Admin', 'SuperAdmin']), classControl.deleteUsersFromClass)

  // External
  app.get('/api/external/:id', hasRole(['Admin', 'SuperAdmin']), userControl.getExternal)
  app.post('/api/external/class', hasRole(['SuperAdmin']), classControl.assignExternalPersonnelToClass)
  app.delete('/api/external/class', hasRole(['SuperAdmin']), classControl.removeExternalPersonnelFromClass)

  // Attendance controls
  app.post('/api/attendance', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.addEditAttendance)
  app.delete('/api/attendance', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.deleteAttendance)
  app.get('/api/attendance/:id', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceById)
  app.get('/api/attendance/class/:classId?/dateStart/:dateStart?/dateEnd/:dateEnd?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendance)
  app.get('/api/attendance/user/:userId/:dateStart-:dateEnd/:classId?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceByUser)
  app.get('/api/attendance/student/:studentId/:dateStart-:dateEnd/:classId?', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getAttendanceByStudent)
  app.get('/api/attendance/:classId/summary', hasRole(['Tutor', 'Mentor', 'SuperVisor', 'Admin', 'SuperAdmin']), attendanceControl.getClassAttendanceSummary) // Very VERBOSE
  app.get('/api/attendance/summary/all', hasRole(['Admin', 'SuperAdmin']), attendanceControl.getAllClassAttendanceSummary)

  // Admin controls under user
  app.get('/api/admin/pendingUsers', hasRole(['SuperAdmin']), adminControl.getPendingUsers)
  app.get('/api/admin/suspended', hasRole(['SuperAdmin']), adminControl.getSuspendedPeople)
  app.get('/api/admin/deleted', hasRole(['SuperAdmin']), adminControl.getDeletedPeople)
  app.post('/api/admin/user', hasRole(['SuperAdmin']), adminControl.createUser)
  app.post('/api/admin/userStatusPermissions', hasRole(['SuperAdmin']), adminControl.changeUserStatusAndPermissions)
  app.delete('/api/admin/user', hasRole(['SuperAdmin']), adminControl.multipleUserDelete) //  Admin Mass deletion

  app.post('/api/register', authControl.register)
  app.post('/api/login', authControl.login)
  app.post('/api/changepassword', authControl.changePassword)
  app.post('/api/resetpassword', authControl.resetPassword)
  app.post('/api/verifyEmail', authControl.verifyEmail)
  app.get('/api/check', authControl.check) // This is for frontend to check validity of token.
}
