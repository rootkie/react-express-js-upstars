import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Dimmer, Loader } from 'semantic-ui-react'
import AttendanceView from './AttendanceView.js'
import AttendanceClass from './AttendanceClass.js'
import AttendanceUser from './AttendanceUser.js'
import AttendanceStudent from './AttendanceStudent.js'
import AttendanceForm from './AttendanceForm.js'
import AttendanceSearch from './AttendanceSearch.js'
import axios from 'axios'

class AttendanceWrap extends Component {
  state = {
    classData: [],
    isLoading: true
  }

  // get data from server
  constructor (props) {
    super(props)
    axios({
        method: 'get',
        url: '/class',
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNTk0Mjk5LCJleHAiOjE1MDE5NTQyOTl9.brDQ02F1oPCwqflZ7HXsqUCI2Min1ZVW7c1rqMVgyUw'},
      }).then((response) => {
        let classOption =  []
        for (let [index, options] of response.data.classes.entries()) {
          classOption[index] = {
            value: options._id,
            text: options.className,
            key: options.className
          }
        }
        this.setState({ classData: classOption, isLoading: false })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  render () {
    const { isLoading } = this.state
    const { op, sid } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
      return (
        <div>
          {op === 'add' && <AttendanceForm classData={this.state.classData} /> }
          {op === 'search' && <AttendanceSearch classData={this.state.classData} /> }
          {op === 'view' && <AttendanceView attendanceId={sid} /> }
          {op === 'user' && <AttendanceUser />}
          {op === 'student' && <AttendanceStudent />}
          {op === 'class' && <AttendanceClass />}
        </div>
      )
    }
  }
}

AttendanceWrap.propTypes = {
  op: PropTypes.string
}

export default AttendanceWrap
