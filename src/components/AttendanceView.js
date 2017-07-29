import React, { Component } from 'react'
import { Form, Message, Button, Header, Table, Checkbox, Modal } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const initialState = {
  date: moment('2017-01-01T00:00:00.000Z'),
  className: 'Python2',
  type: 'Class',
  hours: 2,
  edit: false,
  error: [],
  buttonName: 'Edit',
  deleteConfirm: false
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' },
]

// Populate using students from the class
const students = [
  { key: 'student1', text: 'Student1', value: '12345', status: '1', checked: true },
  { key: 'student2', text: 'Student2', value: '23456', status: '0', checked: false },
  { key: 'student3', text: 'Student3', value: '45678', status: '1', checked: true },
]
// Populate using users from the class
const users = [
  { key: 'user1', text: 'User1', value: '12345', status: '1', checked: true },
  { key: 'user2', text: 'User2', value: '23456', status: '1', checked: true },
  { key: 'user3', text: 'User3', value: '45678', status: '1', checked: true },
]

class AttendanceView extends Component {
  state = {
    ...initialState,
    users,
    students,
    edit: false,
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
    let pos = users.map(function(usr) { return usr.value }).indexOf(name)
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
    let pos = students.map(function(usr) { return usr.value }).indexOf(name)
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

  handleChangeType = (e, { value }) => {
      this.setState({ type: value })
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
  
  handleEdit = e => {
    e.preventDefault()
    if (this.state.edit === false) this.setState({ edit: true, buttonName: 'Save' })
    else this.setState({ edit: false, buttonName: 'Edit' })
  }
  
  handleDelete = e => {
    e.preventDefault()
    this.setState({deleteConfirm: true})
  }

  handleSubmit = e => {
    e.preventDefault()
    const { date, className, type, students, users, hours } = this.state
    // check required fields
    const error = this.checkRequired(['date', 'className', 'type', 'students', 'users'])
    if (error.length === 0) {
      console.log('submit success')
      /* submits sth to server */
      console.table({ date, className, type, students, users, hours })
      this.setState({...initialState, submitSuccess: true})
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  render () {
    const { date, type, className, students, users, error, submitSuccess, hours, edit, buttonName, deleteConfirm } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form>
          <Form.Group widths='equal'>
            <Form.Input label='Class' placeholder='Name of class' name='className' value={className} onChange={this.handleChange} error={error.includes('className')} disabled required />
            <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={this.handleChangeType} error={error.includes('type')} disabled={edit === false} required />
            <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={this.handleChange} error={error.includes('hours')} disabled={type !== 'Class' || edit === false} required={type === 'Class'} />
        </Form.Group>
        <Form.Group widths='equal'>
        <Form.Field required>
              <label>Date of class</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={date}
                disabled={true}
                isClearable />
            </Form.Field>
        </Form.Group>
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
                <Checkbox name={options.value} onChange={this.handleCheckboxChangeForStudent} checked={options.checked} disabled={type !== 'Class' || edit === false} />
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
                <Checkbox name={options.value} onChange={this.handleCheckboxChangeForUser} checked={options.checked} disabled={type !== 'Class' || edit === false} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        </Table>
        <Form.Group widths='equal'>
          <Form.Button onClick={this.handleEdit} floated='right'>{buttonName}</Form.Button>
          <Form.Button negative floated='left' onClick={this.handleDelete}>Delete</Form.Button>
          </Form.Group>
        </Form>
        <Modal
            open={deleteConfirm}
            header='Delete Your Account'
            content='Are you sure you want to delete your account'
             actions={[
                { key: 'no', content: 'No', color: 'red', triggerClose: true },
                { key: 'yes', content: 'Yes', color: 'green', triggerClose: true },
              ]}
        />
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

export default AttendanceView
