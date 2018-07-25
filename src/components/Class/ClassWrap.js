import React, { Component } from 'react'
import { object, array } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import ClassEdit from './ClassEdit.js'
import axios from 'axios'

// Declare variables that originate from the URI
class ClassWrap extends Component {
  static propTypes = {
    match: object.isRequired,
    roles: array.isRequired
  }
  // First init of state.
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
        let allClass = response.data.activeClasses.concat(response.data.stoppedClasses)
        console.log(allClass)
        this.setState({ classData: allClass, isLoading: false })
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
      // Adds the new class to the array of ACTIVE classes so that when you click view you can see it immediately.
        this.setState({ classData: classData.concat({ ...classDataToSubmit, _id: response.data.newClass._id }) })
      })
  }

  // Called from ClassEdit during submit to PUT the necessary info into the DB
  editClass = (classDataToSubmit) => {
    const { classData } = this.state
    const { sid } = this.props.match.params
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

  stopClass = (classIds) => {
    let data = {
      classId: classIds
    }
    console.log(data)
    // After the deletion API is successful, remove these items from the front-end
    return axios.delete('/class', {
      data})
      .then(() => {
        this.getClasses()
      }).catch((error) => {
        console.log(error)
      })
  }

  // Various routes that would render different components
  render () {
    const { roles, match } = this.props
    const { op, sid } = match.params
    const { classData, isLoading } = this.state
    return (
      <div>
        {op === 'add' && <ClassForm addClass={this.addClass} /> }
        {op === 'id' && <ClassEdit editClass={this.editClass} id={sid} roles={roles} /> }
        {op === 'view' && <ClassView classData={classData} stopClass={this.stopClass} isLoading={isLoading} roles={roles} /> }
      </div>
    )
  }
}
export default ClassWrap
