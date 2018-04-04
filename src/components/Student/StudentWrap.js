import React, { Component } from 'react'
import { string } from 'prop-types'
import StudentForm from './StudentForm'
import StudentView from './StudentView'
import StudentEdit from './studentEdit'
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
      isLoading: true
    }
    this.getStudents()
  }

  getStudents = () => {
    axios.get('students')
      .then(response => {
        this.setState({ studentData: response.data.students, isLoading: false })
      })
      .catch(err => {
        console.log(err)
      })
  }

  addStudent = (studentDataToSubmit) => {
    return axios.post('/students', studentDataToSubmit)
      .then(response => {
        this.getStudents()
        return response.data.newStudent
      })
  }

  editStudent = (studentDataToSubmit) => {
    const { sid } = this.props
    return axios.put('/students', {
      ...studentDataToSubmit,
      studentId: sid
    })
      .then(response => {
        this.getStudents()
      })
  }

  // Calls getStudent to refresh the state
  deleteStudent = studentId => {
    axios.delete('/students',
      {
        data: {
          studentId
        }
      })
      .then((response) => {
        this.getStudents()
      })
      .catch((err) => console.log(err))
  }

  // filteredData could be different from the studentData
  // studentData is everything untouched which filtered changes. The front-end will display the filtered data as a priority to studentData
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
        {op === 'edit' && <StudentEdit id={sid} editStudent={this.editStudent} />}
        {op === 'view' && <StudentView studentData={filteredData || studentData} deleteStudent={this.deleteStudent} searchFilter={this.searchFilter} isLoading={isLoading} />}
      </div>
    )
  }
}

export default StudentWrap
