import React from 'react'
import PropTypes from 'prop-types'
import StudentForm from './StudentAdd'
import StudentTest from './StudentTest'

const StudentWrap = ({ op }) => (
  <div>
    {op === 'add' && <StudentForm /> }
    {op === 'edit' && <StudentTest />}
    {op === 'view' && <h2>View</h2>}
  </div>
)

StudentWrap.propTypes = {
  op: PropTypes.string
}

export default StudentWrap
