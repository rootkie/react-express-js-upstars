import React from 'react'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'

const VolunteerWrap = ({ op, sid }) => (
  <div>
    {op === 'changepassword' && <VolunteerChangePassword /> }
    {op === 'profile' && <VolunteerEdit userId={sid} />}
    {op === 'view' && <VolunteerView />}
  </div>
)

VolunteerWrap.propTypes = {
  op: PropTypes.string,
  sid: PropTypes.string
}

export default VolunteerWrap
