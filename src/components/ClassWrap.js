import React, { Component } from 'react'
import { string } from 'prop-types'
import ClassForm from './ClassForm.js'
import ClassView from './ClassView.js'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class ClassWrap extends Component {
  static propTypes = {
    op: string.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      classData: []
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

  deleteClass = (classId) => {
    axios.delete('/class',
      {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          classId
        }
      }).then((response) => {
        // instant update of classData.
        this.setState({classData: this.state.classData.filter((Class) => classId !== Class._id )})
      }).catch((error)=>{
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
