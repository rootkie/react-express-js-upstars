import React from 'react'
import PropTypes from 'prop-types'
import AttendanceView from './AttendanceView.js'
import AttendanceClass from './AttendanceClass.js'
import AttendanceUser from './AttendanceUser.js'
import AttendanceStudent from './AttendanceStudent.js'
import axios from 'axios'


const AttendanceWrap = ({ op }) => (
  <div>
    {op === 'add' && <div>add</div> }
    {op === 'search' && <AttendanceView /> }
    {op === 'user' && <AttendanceUser />}
    {op === 'student' && <AttendanceStudent />}
    {op === 'class' && <AttendanceClass />}
  </div>
)

AttendanceWrap.propTypes = {
  op: PropTypes.string
}

export default AttendanceWrap
