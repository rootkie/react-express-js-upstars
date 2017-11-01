import React, { Component } from 'react'
import { string } from 'prop-types'
import StudentForm from './StudentForm'
import StudentView from './StudentView'
import axios from 'axios'
import { filterData } from '../../utils'

class StudentWrap extends Component {
  static propTypes = {
    op: string.isRequired,
    sid: string
  }

  // get data from server
  constructor (props) {
    super(props)
    this.state = {
      studentData: [],
      filteredData: false,
      isLoading: true,
      headerConfig: {'headers': { 'x-access-token': localStorage.token }}
    }
    this.getStudents()
  }

  getStudents = () => {
    axios.get('students', this.state.headerConfig)
      .then((response) => {
        this.setState({ studentData: response.data.students, isLoading: false })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  addStudent = (studentDataToSubmit) => {
    const { studentData } = this.state
    return axios.post('/students', studentDataToSubmit, this.state.headerConfig)
      .then((response) => {
        this.setState({ studentData: studentData.concat({ ...studentDataToSubmit, _id: response.data.newStudent._id }) })
      })
  }

  editStudent = (studentDataToSubmit) => {
    const { studentData } = this.state
    const { sid } = this.props
    return axios.put('/students', {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': localStorage.token
      },
      ...studentDataToSubmit,
      studentId: sid
    })
      .then(() => {
        const updatedStudentData = studentData.map((element) => (
          element._id === sid ? {...studentDataToSubmit, _id: sid} : element
        ))
        this.setState({studentData: updatedStudentData})
      })
  }

  deleteStudent = (studentIds) => {
    const studentRequestPromises = []
    for (let studentId of studentIds) {
      studentRequestPromises.push(
        axios.delete('/students',
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': localStorage.token
            },
            data: {
              studentId
            }
          })
      )
    }

    axios.all(studentRequestPromises)
      .then((response) => {
        this.setState({studentData: this.state.studentData.filter((student) => !studentIds.includes(student._id))})
      })
      .catch((err) => console.log(err))
  }

  searchFilter = (criteria) => {
    const { studentData } = this.state
    this.setState({filteredData: filterData(studentData, criteria)})
  }

  render () {
    const { studentData, filteredData, isLoading } = this.state
    const { op, sid } = this.props
    return (
      <div>
        {op === 'add' && <StudentForm addStudent={this.addStudent} /> }
        {op === 'edit' && <StudentForm studentData={filterData(this.state.studentData, [{field: '_id', value: sid}])[0]} edit editStudent={this.editStudent} /> }
        {op === 'view' && <StudentView studentData={filteredData || studentData} deleteStudent={this.deleteStudent} searchFilter={this.searchFilter} isLoading={isLoading} />}
      </div>
    )
  }
}

export default StudentWrap
