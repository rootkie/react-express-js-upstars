import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { array, object } from 'prop-types'
import StudentForm from './StudentForm'
import StudentView from './StudentView'
import StudentEdit from './StudentEdit'
import StudentViewOthers from './StudentViewOthers'
import axios from 'axios'
import { filterData } from '../../utils'
import ErrorPage from '../Error/ErrorPage'

class StudentWrap extends Component {
  static propTypes = {
    match: object.isRequired,
    roles: array.isRequired
  }

  // get data from server
  constructor (props) {
    super(props)
    let { roles } = props
    this.state = {
      studentData: [],
      otherStudentData: [],
      filteredData: false,
      filteredDataOthers: false,
      isLoading: true
    }
    this.getStudents()
    if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
      this.getOtherStudents()
    }
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

  getOtherStudents = () => {
    axios.get('otherStudents')
      .then(response => {
        this.setState({ otherStudentData: response.data.students })
      })
      .catch(err => {
        console.log(err)
      })
  }

  addStudent = (studentDataToSubmit) => {
    return axios.post('admin/students', studentDataToSubmit)
      .then(response => {
        this.getStudents()
        return response.data.newStudentId
      })
  }

  editStudent = (studentDataToSubmit) => {
    const { sid } = this.props.match.params
    let { roles } = this.props
    return axios.put('/students', {
      ...studentDataToSubmit,
      studentId: sid
    })
      .then(response => {
        this.getStudents()
        if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
          this.getOtherStudents()
        }
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

  searchFilterOthers = (criteria) => {
    const { otherStudentData } = this.state
    this.setState({filteredDataOthers: filterData(otherStudentData, criteria)})
  }

  render () {
    const { studentData, otherStudentData, filteredData, isLoading, filteredDataOthers } = this.state
    const { roles, match } = this.props
    return (
      <div>
        <Switch>
          <Route exact path={`${match.path}/add`} render={() => <StudentForm addStudent={this.addStudent} />} />
          <Route exact path={`${match.path}/edit/:id`} render={props => <StudentEdit editStudent={this.editStudent} roles={roles} {...props} />} />
          <Route exact path={`${match.path}/view`} render={() => <StudentView studentData={filteredData || studentData} deleteStudent={this.deleteStudent} searchFilter={this.searchFilter} isLoading={isLoading} roles={roles} />} />
          <Route exact path={`${match.path}/viewOthers`} render={() => <StudentViewOthers studentData={filteredDataOthers || otherStudentData} searchFilter={this.searchFilterOthers} isLoading={isLoading} />} />
          <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
        </Switch>
      </div>
    )
  }
}

export default StudentWrap
