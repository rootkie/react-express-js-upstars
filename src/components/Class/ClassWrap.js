import React, { Component } from 'react'
import { string } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import axios from 'axios'
import { filterData } from '../../utils.js'

// Declare variables that originate from the URI
class ClassWrap extends Component {
  static propTypes = {
    op: string.isRequired,
    sid: string
  }
// First init of state
  constructor (props) {
    super(props)
    this.state = {
      classData: [],
      students: [],
      users: [],
      isLoading: true,
      headerConfig: {'headers': { 'x-access-token': window.localStorage.token }}
    }
    this.getClasses()
  }
// API Call to GET all classes and their respective students and users information
  getClasses = () => {
    axios.get('class', this.state.headerConfig)
      .then((response) => {
        this.setState({ classData: response.data.classes, isLoading: false })
      })
      .catch((err) => {
        console.log(err)
      })
      // API call to GET all students
    axios.get('students', this.state.headerConfig)
        .then(response => {
          this.setState({ students: response.data.students })
          console.log(response)
        })
        // API Call to GET all users
    axios.get('users', this.state.headerConfig)
        .then(response => {
          this.setState({ users: response.data.users })
          console.log(response)
        })
  }
// functions that are called from props in Class dependent js
  addClass = (classDataToSubmit) => {
    const { classData } = this.state
    return axios.post('/class', classDataToSubmit, this.state.headerConfig)
      .then((response) => {
        this.setState({ classData: classData.concat({ ...classDataToSubmit, _id: response.data.newClass._id }) })
      })
  }

  editClass = (classDataToSubmit) => {
    const { classData } = this.state
    const { sid } = this.props
    return axios.put('/class', {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.token
      },
      ...classDataToSubmit,
      classId: sid
    })
      .then(() => {
        const updatedClassData = classData.map((element) => (
          element._id === sid ? {...classDataToSubmit, _id: sid} : element
        ))
        this.setState({classData: updatedClassData})
      })
  }

  deleteClass = (classIds) => {
    let data = {
      classId: classIds
    }
    console.log(data)
    return axios.delete('/class', {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': window.localStorage.token
      },
      data})
        .then(() => {
          this.setState({classData: this.state.classData.filter((Class) => !classIds.includes(Class._id))})
        }).catch((error) => {
          console.log(error)
        })
  }

  addStudent = () => {

  }

  // Various routes that would render different components
  render () {
    const { op, sid } = this.props
    const { classData, isLoading } = this.state
    return (
      <div>
        {op === 'add' && <ClassForm addClass={this.addClass} /> }
        {op === 'edit' && <ClassForm classData={filterData(this.state.classData, [{field: '_id', value: sid}])[0]} edit editClass={this.editClass} /> }
        {op === 'view' && <ClassView classData={classData} deleteClass={this.deleteClass} isLoading={isLoading} /> }
      </div>
    )
  }
  }
export default ClassWrap
