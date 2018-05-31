import React from 'react'
import PropTypes from 'prop-types'
import VolunteerAdminForm from './CreateUser'
import ChangeStatus from './ChangeStatus'

const AdminWrap = ({ op }) => (
  <div>
    {op === 'user' && <VolunteerAdminForm /> }
    {op === 'status' && <ChangeStatus />}
  </div>
)

AdminWrap.propTypes = {
  op: PropTypes.string
}

export default AdminWrap
