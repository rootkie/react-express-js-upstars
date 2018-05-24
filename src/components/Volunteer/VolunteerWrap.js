import React, { Component } from 'react'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'
import axios from 'axios'
import { filterData } from '../../utils'

class VolunteerWrap extends Component {
  static propTypes = {
    op: PropTypes.string,
    sid: PropTypes.string
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

  // filteredData could be different from the userData
  // userData is everything untouched which filtered changes. The front-end will display the filtered data as a priority to userData
  searchFilter = (criteria, userData) => {
    return filterData(userData, criteria)
  }

  render () {
    const { op, sid } = this.props
    return (
      <div>
        {op === 'changepassword' && <VolunteerChangePassword /> }
        {op === 'profile' && <VolunteerEdit userId={sid} />}
        {op === 'view' && <VolunteerView searchFilter={this.searchFilter} deleteUser={this.deleteUser} />}
      </div>
    )
  }
}

export default VolunteerWrap
