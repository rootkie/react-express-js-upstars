import React from 'react'
import PropTypes from 'prop-types'
import ChangeStatus from './ChangeStatus'

const AdminWrap = ({ match }) => (
  <div>
    {match.params.op === 'status' && <ChangeStatus />}
  </div>
)

AdminWrap.propTypes = {
  match: PropTypes.object
}

export default AdminWrap
