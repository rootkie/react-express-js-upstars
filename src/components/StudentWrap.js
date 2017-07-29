import React, { Component } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import StudentForm from './StudentAdd'
import StudentView from './StudentView'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

function filterData (data, criteria) { // criteria = [{field, value}]
  for (let criterion of criteria) {
    const { field, value } = criterion // field is profile-age, value = ['M']
    return data.filter((student) => {
      if (/-/.test(field)) {
        const fieldArr = field.split('-') // fieldArr = ['profile', 'age']
        return value.includes(student[fieldArr[0]][fieldArr[1]])
      } else {
        return value.includes(student[field])
      }
    }
    )
  }
}

class StudentWrap extends Component {
  state = {
    studentData: [],
    filteredData: false,
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

  deleteStudent = (studentId) => {
    axios.delete('/students',
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          studentId
        }
      })
      .then((response) => {
        this.setState({studentData: this.state.studentData.filter((student) => !studentId.includes(student._id))})
      })
      .catch((err) => console.log(err))
  }

  searchFilter = (criteria) => {
    const { studentData } = this.state
    console.log('passing criteria to filterData', criteria)
    this.setState({filteredData: filterData(studentData, criteria)})
  }

  render () {
    const { isLoading, studentData, filteredData } = this.state
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
          {op === 'view' && <StudentView studentData={filteredData || studentData} deleteStudent={this.deleteStudent} searchFilter={this.searchFilter} />}
        </div>
      )
    }
  }
}

StudentWrap.propTypes = {
  op: PropTypes.string
}

export default StudentWrap
