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
        // Regarding this, perhaps all the API (pages) are open to Admin and above, Tutors are only allowed maybe 'add', 'class' (their own ones)
        // Add - Form to add attendance
        // Search - Overall search, the most open type
        // View - Form similar to 'add', to edit and view individual attendances
        // user and student - search based on the students' attendance
        // class - search based on classes. Although similar search could be done at the 'search' page, this is an overview, likely to have stats and charts.
        <div>
          {op === 'add' && <AttendanceForm classData={this.state.classData} /> }
          {op === 'search' && <AttendanceSearch classData={this.state.classData} /> }
          {op === 'view' && sid && <AttendanceView attendanceId={sid} /> }
          {op === 'user' && <AttendanceUser classData={this.state.classData} />}
          {op === 'student' && <AttendanceStudent classData={this.state.classData} />}
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
