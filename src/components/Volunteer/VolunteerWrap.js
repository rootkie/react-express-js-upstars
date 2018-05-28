import React, { Component } from 'react'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'
import axios from 'axios'

class VolunteerWrap extends Component {
  static propTypes = {
    op: PropTypes.string,
    sid: PropTypes.string,
    _id: PropTypes.string
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
    const { op, sid, _id } = this.props
    return (
      <div>
        {op === 'changepassword' && <VolunteerChangePassword _id={_id} /> }
        {op === 'profile' && <VolunteerEdit userId={sid} />}
        {op === 'view' && <VolunteerView deleteUser={this.deleteUser} />}
      </div>
    )
  }
}

export default VolunteerWrap
