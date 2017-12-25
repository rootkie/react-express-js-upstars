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
      oneClassData: [],
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
      // Adds the new class to the array of classes so that when you click view you can see it immediately.
        this.setState({ classData: classData.concat({ ...classDataToSubmit, _id: response.data.newClass._id }) })
        return response
      })
      .catch(err => {
        console.log(err)
      })
  }

  // Called from ClassEdit during submit to PUT the necessary info into the DB
  editClass = (classDataToSubmit) => {
    const { classData } = this.state
    const { sid } = this.props
    return axios.put('/class', {
      ...classDataToSubmit,
      classId: sid
    })
      .then(() => {
        // Loop through and if that array contains the same _id as the request id (sid), change it and leaving the rest the same.
        // This allows the ClassName edited and shown on the overview page to update instantly.
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
    // After the deletion API is successful, remove these items from the front-end
    return axios.delete('/class', {
      data})
        .then(() => {
          this.setState({classData: this.state.classData.filter((Class) => !classIds.includes(Class._id))})
        }).catch((error) => {
          console.log(error)
        })
  }

  // Various routes that would render different components
  render () {
    const { op, sid } = this.props
    const { classData, isLoading } = this.state
    return (
      <div>
        {op === 'add' && <ClassForm addClass={this.addClass} /> }
        {op === 'id' && <ClassEdit editClass={this.editClass} id={sid} /> }
        {op === 'view' && <ClassView classData={classData} deleteClass={this.deleteClass} isLoading={isLoading} /> }
      </div>
    )
  }
  }
export default ClassWrap
