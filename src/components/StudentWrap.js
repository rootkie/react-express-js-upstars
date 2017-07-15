import React from 'react'
import PropTypes from 'prop-types'
import StudentForm from './StudentAdd'
import StudentView from './StudentView'

const StudentWrap = ({ op }) => (
  <div>
    {op === 'add' && <StudentForm /> }
    {op === 'edit' && <div>edit</div>}
    {op === 'view' && <StudentView />}
  </div>
)

StudentWrap.propTypes = {
  op: PropTypes.string
}

export default StudentWrap
