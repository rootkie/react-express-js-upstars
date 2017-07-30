import React from 'react'
import PropTypes from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'

const ClassWrap = ({ op }) => (
  <div>
    {op === 'add' && <ClassForm /> }
    {op === 'view' && <ClassView /> }
  </div>
)

ClassWrap.propTypes = {
  op: PropTypes.string
}

export default ClassWrap
