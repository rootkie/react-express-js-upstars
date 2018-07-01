import React, { Component } from 'react'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'
import axios from 'axios'

class VolunteerWrap extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    _id: PropTypes.string,
    roles: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      filterData: false
    }
  }

  deleteUser = (userId) => {
    axios.delete('/admin/user',
      {
        data: {
          userId
        }
      })
      .catch((err) => console.log(err))
  }

  render () {
    const { match, _id, roles } = this.props
    const { op, sid } = match.params
    return (
      <div>
        {op === 'changepassword' && <VolunteerChangePassword _id={_id} /> }
        {op === 'profile' && <VolunteerEdit userId={sid} roles={roles} />}
        {op === 'view' && <VolunteerView deleteUser={this.deleteUser} roles={roles} />}
      </div>
    )
  }
}

export default VolunteerWrap
