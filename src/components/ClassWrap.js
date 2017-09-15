import React, { Component } from 'react'
import { string } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import axios from 'axios'
import { filterData } from '../utils'

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
        this.setState({ classData: response.data.classes, isLoading: false })
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
    return axios.put('/class', {
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
    let data = {
      classId:classIds
    }
    console.log(data)
    return axios.delete('/class', {
      headers: {
        'Content-Type': 'application/json'
      },data})
        .then(() => {
          this.setState({classData: this.state.classData.filter((Class) => !classIds.includes(Class._id))})
        }).catch((error) => {
          console.log(error)
        })
  }

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
