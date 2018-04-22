import React from 'react'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerAdminForm'
import VolunteerChangePassword from './VolunteerChangePassword'

const VolunteerWrap = ({ op }) => (
  <div>
    {op === 'changepassword' && <VolunteerChangePassword /> }
    {op === 'profile' && <VolunteerEdit />}
    {op === 'view' && <VolunteerView />}
  </div>
)

VolunteerWrap.propTypes = {
  op: PropTypes.string
}

export default VolunteerWrap
