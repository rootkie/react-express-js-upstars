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

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class AttendanceWrap extends Component {
  state = {
    classData: [],
    isLoading: true
  }

  // get data from server
  constructor (props) {
    super(props)
    axios.get('class')
      .then((response) => {
        this.setState({ classData: response.data.classes, isLoading: false })
        console.log(this.state.classData)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  render () {
    const { isLoading } = this.state
    const { op } = this.props
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
          {op === 'add' && <AttendanceForm classes={this.state.classData} /> }
          {op === 'search' && <AttendanceSearch /> }
          {op === 'view' && <AttendanceView /> }
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
