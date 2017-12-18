import React, { Component } from 'react'
import { string } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import ClassEdit from './ClassEdit.js'
import axios from 'axios'

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
      isLoading: true
    }
    this.getClasses()
  }
// API Call to GET all classes and their respective students and users information. Exposed to every single role.
  getClasses = () => {
    axios.get('class')
      .then(response => {
        this.setState({ classData: response.data.classes, isLoading: false })
      })
      .catch((err) => {
        console.log(err)
      })
  }

// functions that are called from props in Class dependent js
  addClass = (classDataToSubmit) => {
    const { classData } = this.state
    return axios.post('/class', classDataToSubmit)
      .then(response => {
        this.setState({ classData: classData.concat({ ...classDataToSubmit, _id: response.data.newClass._id }) })
      })
  }

  editClass = (classDataToSubmit) => {
    const { classData } = this.state
    const { sid } = this.props
    return axios.put('/class', {
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
      data})
        .then(() => {
          this.setState({classData: this.state.classData.filter((Class) => !classIds.includes(Class._id))})
        }).catch((error) => {
          console.log(error)
        })
  }

  addStudent = () => {

  }

  getOneClass = () => {
    let classId = this.props.sid
    this.setState({ isLoading: true })
    axios.get('class/' + classId, this.state.headerConfig)
    .then(response => {
      this.setState({ classData: response.data.class, isLoading: false })
      console.log(response.data.class)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  // Various routes that would render different components
  render () {
    const { op } = this.props
    const { classData, isLoading } = this.state
    return (
      <div>
        {op === 'add' && <ClassForm addClass={this.addClass} /> }
        {op === 'edit' && <ClassEdit classData={this.getOneClass} editClass={this.editClass} /> }
        {op === 'view' && <ClassView classData={classData} deleteClass={this.deleteClass} isLoading={isLoading} /> }
      </div>
    )
  }
  }
export default ClassWrap
