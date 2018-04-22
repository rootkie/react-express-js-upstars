import React from 'react'
import PropTypes from 'prop-types'
import ChangePassword from './ChangePassword'
import VolunteerAdminForm from './CreateUser'
import ChangeStatus from './ChangeStatus'

const AdminWrap = ({ op }) => (
  <div>
    {op === 'user' && <VolunteerAdminForm /> }
    {op === 'password' && <ChangePassword />}
    {op === 'status' && <ChangeStatus />}
  </div>
)

AdminWrap.propTypes = {
  op: PropTypes.string
}

export default AdminWrap
