import React from 'react'
import PropTypes from 'prop-types'
import ClassForm from './ClassForm.js'
const ClassWrap = ({ op }) => (
  <div>
    {op === 'add' && <ClassForm /> }
    {op === 'view' && <h2>View</h2>}
  </div>
)

ClassWrap.propTypes = {
  op: PropTypes.string
}

export default ClassWrap
