import React, { Component } from 'react'
import { string } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class ClassWrap extends Component {
  static propTypes = {
    op: string.isRequired,
    sid: string
  }

  constructor (props) {
    super(props)
    this.state = {
      classData: [],
      isLoading: true
    }
    this.getClasses()
  }

  getClasses = () => {
    axios.get('class')
      .then((response) => {
        this.setState({ classData: response.data.classes })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  addClass = (classDataToSubmit) => {
    const { classData } = this.state
    return axios.post('/class', classDataToSubmit)
      .then((response) => {
        this.setState({ classData: classData.concat({ ...classDataToSubmit, _id: response.data.newClass._id }) })
      })
  }

  editClass = (classDataToSubmit) => {
    const { classData } = this.state
    const { sid } = this.props
    return axios.put('/students', {
      headers: {
        'Content-Type': 'application/json'
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
    const classRequestPromises = []
    for (let classId of classIds) {
      classRequestPromises.push(
        axios.delete('class', {
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            classId
          } }))
    }

    axios.all(classRequestPromises)
      .then((response) => {
        // instant update with multiple deletes
        this.setState({classData: this.state.classData.filter((Class) => !classIds.includes(Class._id))})
      }).catch((error) => {
        console.log(error)
      })
  }

  render () {
    const { op } = this.props
    const { classData } = this.state
    return (
      <div>
        {op === 'add' && <ClassForm /> }
        {op === 'view' && <ClassView classData={classData} deleteClass={this.deleteClass} /> }
      </div>
    )
  }
}
export default ClassWrap
