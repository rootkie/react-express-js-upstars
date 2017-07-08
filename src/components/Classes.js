import React from 'react'
import PropTypes from 'prop-types'
import ClassForm from './ClassForm.js'
const Classes = ({ op }) => (
  <div>
    {op === 'add' && <ClassForm /> }
    {op === 'edit' && <h2>Edit</h2>}
    {op === 'view' && <h2>View</h2>}
  </div>
)

Classes.propTypes = {
  op: PropTypes.string
}

export default Classes
