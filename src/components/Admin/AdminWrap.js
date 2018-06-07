import React from 'react'
import PropTypes from 'prop-types'
import ChangeStatus from './ChangeStatus'

const AdminWrap = ({ op }) => (
  <div>
    {op === 'status' && <ChangeStatus />}
  </div>
)

AdminWrap.propTypes = {
  op: PropTypes.string
}

export default AdminWrap
