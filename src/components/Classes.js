import React from 'react'
import Filler from './Filler'
import PropTypes from 'prop-types'

const Classes = ({ op }) => (
  <div>
    {op === 'add' && <h2>Add</h2>}
    {op === 'edit' && <h2>Edit</h2>}
    {op === 'view' && <h2>View</h2>}
    <Filler num={10} />
  </div>
)

Classes.propTypes = {
  op: PropTypes.string
}

export default Classes
