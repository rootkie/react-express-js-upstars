import React from 'react'
import PropTypes from 'prop-types'
import StudentForm from './StudentAdd.js'

const StudentWrap = ({ op }) => (
  <div>
    {op === 'add' && <StudentForm /> }
    {op === 'edit' && <h2>Edit</h2>}
    {op === 'view' && <h2>View</h2>}
  </div>
)

StudentWrap.propTypes = {
  op: PropTypes.string
}

export default StudentWrap
