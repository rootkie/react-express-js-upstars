import React, { Component } from 'react'
import { Form, Message, Button, Header } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'

const initialState = {
  date: '',
  className: '',
  type: '',
  students: [],
  users: [],
  error: []
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' },
]

// Populate this by calling getClasses API in wrap and sending in as props. Then selected class will send an API here to get users and students
const classNameOptions = [
  { key: 'python2', text: 'Python2', value: '12345' },
  { key: 'machinelearning', text: 'Machine Learning', value: '23456' },
  { key: 'itsecurity', text: 'ICT Security', value: '45678' },
]
// Populate using students from the class
const studentsOptions = [
  { key: 'student1', text: 'Student1', value: '12345', checked: true },
  { key: 'student2', text: 'Student2', value: '23456', checked: true },
  { key: 'student3', text: 'Student3', value: '45678', checked: true },
]
// Populate using users from the class
const usersOptions = [
  { key: 'user1', text: 'User1', value: '12345', checked: true },
  { key: 'user2', text: 'User2', value: '23456', checked: true },
  { key: 'user3', text: 'User3', value: '45678', checked: true },
]

class AttendanceForm extends Component {
  state = {
    ...initialState, 
    submitSuccess: false
  }

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleSubmit = e => {
    e.preventDefault()
    const { date, className, type, students, users  } = this.state
    // check required fields
    const error = this.checkRequired(['date', 'className', 'type', 'students', 'users'])

    if (error.length === 0) {
      console.log('submit success')
      /* submits sth to server */
      console.table({ date, className, type, students, users })
      this.setState({...initialState, submitSuccess: true})
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  render () {
    const { date, type, className, students, users, error, submitSuccess } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Select label='Class' placeholder='Name of class' name='className' options={classNameOptions} value={className} onChange={this.handleChange} error={error.includes('className')} required />
            <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={this.handleChange} error={error.includes('type')} required />
            <Form.Field>
              <label>Date of class</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={date}
                onChange={this.handleDateChange('date')}
                isClearable required />
            </Form.Field>
        </Form.Group>
          <Header as='h3' dividing>Student Attendance</Header>
          <Form.Group inline>
              <label>List of students</label>
              {studentsOptions.map((option, i) => {
                return (
                  <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handlePreferTime} checked={option.checked}/>
                )
              })}
          </Form.Group>
          <Header as='h3' dividing>User Attendance</Header>
          <Form.Group inline>
              <label>List of users</label>
              {usersOptions.map((option, i) => {
                return (
                  <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handlePreferTime} checked={option.checked} />
                )
              })}
          </Form.Group>
          <Form.Button>Submit</Form.Button>
        </Form>
        <Message
          hidden={!submitSuccess}
          success
          content='Submitted'
          />
        <Message
          hidden={error.length === 0}
          negative
          content='Please Check Required Fields!'
          />
      </div>
    )
  }
}

export default AttendanceForm
