import React from 'react'
import PropTypes from 'prop-types'
import VolunteerForm from './VolunteerForm'
import VolunteerAdminForm from './VolunteerAdminForm'
const VolunteerWrap = ({ op }) => (
  <div>
    {op === 'form-admin' && <VolunteerAdminForm /> }
    {op === 'form' && <VolunteerForm />}
    {op === 'view' && <h2>View</h2>}
  </div>
)

VolunteerWrap.propTypes = {
  op: PropTypes.string
}

export default VolunteerWrap
