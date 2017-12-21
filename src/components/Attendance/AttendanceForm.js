import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Loader, Dimmer } from 'semantic-ui-react'
import { array, object } from 'prop-types'
import DatePicker from 'react-datepicker'
import axios from 'axios'

const initialState = {
  date: '',
  className: '',
  type: '',
  hours: '',
  isLoading: false,
  classSelection: false,
  error: []
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' },
]

// Starting message before the user select class
let students = [{'text': 'Select class to view sudents'}]
let users = [{'text': 'Select class to view users'}]

class AttendanceForm extends Component {
  // Check that classes props is parsed in properly
  static propTypes = {
    classData: array.isRequired
  }
  static contextTypes = {
    router: object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      ...initialState,
      students,
      users,
      submitSuccess: false,
      token: props.token
    }
  }

// Function to check that all those that we specified are required
  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }
  
  // As function name suggests, if the checkbox next to use is checked, it will check for true or false
  // If true, it will find the user among the states using indexOf and change its checked to true and status to 1
  // `name` is actually the userId. In state, user `list` field contains IDs.
  // Same goes for Students checkbox
  handleCheckboxChangeForUser = (e, { name, checked }) => {
    let { users } = this.state
    console.log(name)
    let pos = users.map(usr => { return usr.list }).indexOf(name)
    if (checked) {
        users[pos].status = 1
    } else {
        users[pos].status = 0
  }
    this.setState(users)
}
  
  handleCheckboxChangeForStudent = (e, { name, checked }) => {
    let { students } = this.state
    let pos = students.map(usr => { return usr.list }).indexOf(name)
    console.log(pos)
    if (checked) {
        students[pos].status = 1
    } else {
        students[pos].status = 0
  }
    this.setState(students)
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})
  
  // Special function to GET class based on the one chosen by the user. It sends an API and then loops through the response
  // to populate the user and student array to put into state. After that it calls classSelection and isLoading false to stop the 
  // Loading screen while making the other fields non-disabled for users to key it in.
  handleClass = (e, { value }) => {
    this.setState({ className: value, isLoading: true })
    axios({
        method: 'get',
        url: '/class/' + value,
        headers: {'x-access-token': this.state.token },
      })
      .then(response => {
        let user = [],
        student = []
        
        for (let [index, studentData] of response.data.class.students.entries()) {
          student[index] = {
            list: studentData._id,
            text: studentData.profile.name,
            key: studentData.profile.name,
            status: ''
          }
        }
        
        for (let [index, userData] of response.data.class.users.entries()) {
          user[index] = {
            text: userData.profile.name,
            key: userData.profile.name,
            list: userData._id,
            status: ''
          }
        }
        this.setState({ isLoading: false, classSelection: true, users: user, students: student })
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false, error: 'GOT PROBLEM' })
      });
  }
  
  handleChangeType = (e, { value }) => {
      this.setState({ type: value })
      let { students, users } = this.state
      if (value === 'Class') {
          for (let a = 0; a < students.length; a++) {
              students[a]['status'] = 1
              this.setState(students)
          }
          for (let b = 0; b < users.length; b++) {
              users[b]['status'] = 1
              this.setState(users)
          }
      }
      else {
         for (let a = 0; a < students.length; a++) {
              students[a]['status'] = 0
              this.setState(students)
          }
          for (let b = 0; b < users.length; b++) {
              users[b]['status'] = 0
              this.setState(users)
          }
          this.setState({ hours: 0 })
      }
  }

// Handle submit calls the submit API. It sents the data in exactly the backend wants. Although users and students have 
// additional fields like `key` and `text`, mongoose does not care and will simply ignore it and only accept those defined and accepted by backend
  handleSubmit = e => {
    e.preventDefault()
    const { date, className, type, students, users, hours } = this.state
    // check required fields
    const error = this.checkRequired(['date', 'className', 'type', 'students', 'users'])

    if (error.length === 0) {
      console.log('submit success')
      /* submits sth to server */
      console.table({ date, className, type, students, users, hours })
      axios({
        method: 'post',
        url: '/attendance',
        headers: {'x-access-token': this.state.token },
        data: {
          date,
          classId: className,
          users,
          students,
          hours,
          type
        }
      }).then(response => {
        console.log(response)
        this.setState({...initialState, submitSuccess: true})
        this.context.router.history.push(`/attendance/view/${response.data.attendance._id}`)
      })
      .catch(error => {
        console.log(error);
        this.setState({ error: 'GOT PROBLEM SUBMITTING ATTENDANCE' })
      })
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }
  

  render () {
    const { date, type, className, students, users, error, submitSuccess, hours, classSelection, isLoading } = this.state
    const { classData } = this.props
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Select label='Class' placeholder='Name of class' name='className' options={classData} search selection minCharacters='0' value={className} onChange={this.handleClass} error={error.includes('className')} required />
            <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={this.handleChangeType} error={error.includes('type')} disabled={!classSelection} required />
            <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={this.handleChange} error={error.includes('hours')} disabled={type !== 'Class' || !classSelection} required={type === 'Class'} />
        </Form.Group>
        <Form.Group widths='equal'>
        <Form.Field>
              <label>Date of class</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                disabled={!classSelection}
                selected={date}
                onChange={this.handleDateChange('date')}
                isClearable required />
            </Form.Field>
        </Form.Group>
        <Dimmer active={isLoading} inverted>
            <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
          <Header as='h3' dividing>Student Attendance</Header>
        <Table compact celled>
        <Table.Header>
         <Table.Row>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {students.map((options, i) => (
            <Table.Row key={`users-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForStudent} checked={options.status === 1 ? true : false} disabled={type !== 'Class'} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        </Table>
          <Header as='h3' dividing>User Attendance</Header>
          
           <Table compact celled>
        <Table.Header>
         <Table.Row>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((options, i) => (
            <Table.Row key={`users-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForUser} checked={options.status === 1 ? true : false} disabled={type !== 'Class'} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        </Table>
            
          <Form.Button disabled={!classSelection}>Submit</Form.Button>
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
