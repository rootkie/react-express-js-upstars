import React, { Component } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import StudentForm from './StudentAdd'
import StudentView from './StudentView'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class StudentWrap extends Component {
  state = {
    studentData: [],
    isLoading: true
  }

  // get data from server
  constructor (props) {
    super(props)
    axios.get('students')
      .then((response) => {
        this.setState({ studentData: response.data.students, isLoading: false })
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
          {op === 'add' && <StudentForm /> }
          {op === 'edit' && <div>edit</div>}
          {op === 'view' && <StudentView studentData={this.state.studentData} />}
        </div>
      )
    }
  }
}

StudentWrap.propTypes = {
  op: PropTypes.string
}

export default StudentWrap
