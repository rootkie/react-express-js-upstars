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
  // get data from server. Declare the states.
  constructor (props) {
    super(props)
    this.state = {
      classData: [],
      attendances: [],
      token: window.localStorage.token,
      isLoading: true
    }
    // Temp Solution. Would prefer to only GET classes the user belongs in.
    axios.get('/class')
      .then((response) => {
        let classOption = []
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
          {op === 'add' && <AttendanceForm classData={this.state.classData} token={this.state.token} /> }
          {op === 'search' && <AttendanceSearch classData={this.state.classData} attendances={this.state.attendances} token={this.state.token} /> }
          {op === 'view' && sid && <AttendanceView attendanceId={sid} token={this.state.token} /> }
          {op === 'user' && <AttendanceUser classData={this.state.classData} token={this.state.token} />}
          {op === 'student' && <AttendanceStudent classData={this.state.classData} token={this.state.token} />}
          {op === 'class' && <AttendanceClass classData={this.state.classData} token={this.state.token} />}
        </div>
      )
    }
  }
}

AttendanceWrap.propTypes = {
  op: PropTypes.string,
  sid: PropTypes.string
}

export default AttendanceWrap
