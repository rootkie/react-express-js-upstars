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
      })
  }

  editStudent = (studentDataToSubmit) => {
    const { studentData } = this.state
    const { sid } = this.props
    return axios.put('/students', {
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
        {op === 'edit' && <StudentEdit id={sid} />}
        {op === 'view' && <StudentView studentData={filteredData || studentData} deleteStudent={this.deleteStudent} searchFilter={this.searchFilter} isLoading={isLoading} />}
      </div>
    )
  }
}

export default StudentWrap
