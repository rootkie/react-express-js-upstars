import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Loader } from 'semantic-ui-react'
import { array } from 'prop-types'
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

let students = []
let users = []

// Populate using students from the class
/*const students = [
  { key: 'student1', text: 'Student1', value: '12345', status: '', checked: false },
  { key: 'student2', text: 'Student2', value: '23456', status: '', checked: false },
  { key: 'student3', text: 'Student3', value: '45678', status: '', checked: false },
]
// Populate using users from the class
const users = [
  { key: 'user1', text: 'User1', value: '12345', status: '', checked: false },
  { key: 'user2', text: 'User2', value: '23456', status: '', checked: false },
  { key: 'user3', text: 'User3', value: '45678', status: '', checked: false },
]
*/
class AttendanceForm extends Component {
  static propTypes = {
    classes: array.isRequired
  }
  state = {
    ...initialState,
    students,
    users,
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
  
  handleCheckboxChangeForUser = (e, { name, checked }) => {
    let { users } = this.state
    console.log(name)
    let pos = users.map(usr => { return usr.list }).indexOf(name)
    if (checked) {
        users[pos].checked = true
        users[pos].status = 1
    } else {
        users[pos].checked = false
        users[pos].status = 0
  }
    this.setState(users)
}
  
  handleCheckboxChangeForStudent = (e, { name, checked }) => {
    let { students } = this.state
    let pos = students.map(usr => { return usr.list }).indexOf(name)
    console.log(pos)
    if (checked) {
        students[pos].checked = true
        students[pos].status = 1
    } else {
        students[pos].checked = false
        students[pos].status = 0
  }
    this.setState(students)
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})
  
  handleClass = (e, { value }) => {
    this.setState({ className: value, isLoading: true })
    axios({
        method: 'get',
        url: '/class/' + value,
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNDA0OTY5LCJleHAiOjE1MDE3NjQ5Njl9.v-94Gcu5u6JTgu0Ij-VU2GJ1Ht6ORb1gBYNOZFmhzow'},
      })
      .then(response => {
        let user = [],
        student = []
        
        for (let [index, studentData] of response.data.class.students.entries()) {
          student[index] = {
            list: studentData._id,
            text: studentData.profile.name,
            key: studentData.profile.name,
            checked: false,
            status: ''
          }
        }
        
        for (let [index, userData] of response.data.class.users.entries()) {
          user[index] = {
            text: userData.profile.name,
            key: userData.profile.name,
            list: userData._id,
            checked: false,
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
              students[a]['checked'] = true
              this.setState(students)
          }
          for (let b = 0; b < users.length; b++) {
              users[b]['status'] = 1
              users[b]['checked'] = true
              this.setState(users)
          }
      }
      else {
         for (let a = 0; a < students.length; a++) {
              students[a]['status'] = 0
              students[a]['checked'] = false
              this.setState(students)
          }
          for (let b = 0; b < users.length; b++) {
              users[b]['status'] = 0
              users[b]['checked'] = false
              this.setState(users)
          }
          this.setState({ hours: 0 })
      }
  }

  handleSubmit = e => {
    e.preventDefault()
    const { date, className, type, students, users, hours  } = this.state
    // check required fields
    const error = this.checkRequired(['date', 'className', 'type', 'students', 'users'])

    if (error.length === 0) {
      console.log('submit success')
      /* submits sth to server */
      console.table({ date, className, type, students, users, hours })
      axios({
        method: 'post',
        url: '/attendance',
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNDA0OTY5LCJleHAiOjE1MDE3NjQ5Njl9.v-94Gcu5u6JTgu0Ij-VU2GJ1Ht6ORb1gBYNOZFmhzow'},
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
            <Loader indeterminate active={isLoading}>Loading data</Loader>
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
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForStudent} checked={options.checked} disabled={type !== 'Class'} />
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
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForUser} checked={options.checked} disabled={type !== 'Class'} />
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
