import React, { Component } from 'react'
import { Form, Message, Button, Header, Table, Checkbox, Modal, Dimmer, Loader, Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { Link } from 'react-router-dom'
import axios from 'axios'
import moment from 'moment'


const initialState = {
  date: '',
  className: '',
  classId: '',
  type: '',
  hours: '',
  edit: false,
  error: [],
  isLoading: true,
  empty: true,
  buttonName: 'Edit',
  deleteConfirm: false
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' },
]

const students = [{text: 'Not found. Please try another search'}]
const users = [{text: 'Not found. Please try another search'}]

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
    let pos = users.map(function(usr) { return usr.list }).indexOf(name)
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
    let pos = students.map(function(usr) { return usr.list }).indexOf(name)
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
    else this.handleSubmit(e)
  }
  
  handleDeletePopup = e => {
    e.preventDefault()
    this.setState({deleteConfirm: true})
  }
  
  close = e => {
    e.preventDefault()
    this.setState({deleteConfirm: false})
  }
  
  delete = e => {
    e.preventDefault()
    const { attendanceId } = this.props
    const { classId } = this.state
    this.setState({isLoading: true, deleteConfirm: false})
    axios({
        method: 'delete',
        url: 'attendance',
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNTk0Mjk5LCJleHAiOjE1MDE5NTQyOTl9.brDQ02F1oPCwqflZ7HXsqUCI2Min1ZVW7c1rqMVgyUw'},
        data: {
          attendanceId: [attendanceId],
          classId
        }
      }).then((response) => {
      console.log(response)
      this.setState({ edit: false, buttonName: 'Edit', submitSuccess: true })
      this.setState({isLoading: false})
      window.location.replace("https://test.rootkiddie.com/attendance/search")
      })
  }
  

  handleSubmit = e => {
    e.preventDefault()
    this.setState({isLoading: true})
    const { date, classId, type, students, users, hours } = this.state
    // check required fields
    const error = this.checkRequired(['date', 'classId', 'type', 'students', 'users'])
    if (error.length === 0) {
      console.table({ date, classId, type, students, users, hours })
      axios({
        method: 'post',
        url: 'attendance',
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNTk0Mjk5LCJleHAiOjE1MDE5NTQyOTl9.brDQ02F1oPCwqflZ7HXsqUCI2Min1ZVW7c1rqMVgyUw'},
        data: {
          date,
          classId,
          users,
          students,
          hours,
          type
        }
      }).then((response) => {
      console.log(response)
      this.setState({ edit: false, buttonName: 'Edit', submitSuccess: true })
      this.setState({isLoading: false})
      })
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }
  
  // Handles the getAttendance part:
  constructor (props) {
  super(props)
  let attendanceId = props.attendanceId
  if (attendanceId) {
  axios({
        method: 'get',
        url: 'attendance/' + attendanceId,
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNTk0Mjk5LCJleHAiOjE1MDE5NTQyOTl9.brDQ02F1oPCwqflZ7HXsqUCI2Min1ZVW7c1rqMVgyUw'},
      }).then((response) => {
        console.log(response)
        if (response.status !== 200 || response.data.attendances == null) this.setState({isLoading: false})
        else {
          let data = response.data.attendances
          for (let [index, userData] of data.users.entries()) {
            users[index] = {
              text: userData.list.profile.name,
              key: userData.list._id,
              list: userData.list._id,
              status: userData.status,
              checked: userData.status === 1 ? true : false
            }
          }
          for (let [index, studentData] of data.students.entries()) {
            students[index] = {
              text: studentData.list !== null ? studentData.list.profile.name : 'DELETED. PLEASE DONT ATTEMPT TO EDIT SINCE THERE IS NO ID. CHANGE TO INACTIVE INSTEAD OF DELETE',
              key: studentData.list !== null ? studentData.list._id : 'DELETED. PLEASE DONT ATTEMPT TO EDIT SINCE THERE IS NO ID',
              list: studentData.list !== null ? studentData.list._id : 'DELETED. PLEASE DONT ATTEMPT TO EDIT SINCE THERE IS NO ID',
              status: studentData.status,
              checked: studentData.status === 1 ? true : false
            }
          }
          this.setState({
            isLoading: false, 
            className: data.class.className,
            classId: data.class._id,
            type: data.type,
            hours: data.hours,
            date: moment(data.date),
            users: users,
            students: students,
            empty: false
          })
        }
      })
  }
}
  
  
  render () {
    const { date, type, className, students, users, error, submitSuccess, hours, edit, buttonName, deleteConfirm, isLoading, empty } = this.state // submitted version are used to display the info sent through POST (not necessary)
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
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForStudent} checked={options.checked} disabled={type !== 'Class' || edit === false} />
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
                <Checkbox name={options.list} onChange={this.handleCheckboxChangeForUser} checked={options.checked} disabled={type !== 'Class' || edit === false} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        </Table>
        <Form.Group widths='equal'>
          <Form.Button onClick={this.handleEdit} floated='right' disabled={empty}>{buttonName}</Form.Button>
          <Form.Button negative floated='left' onClick={this.handleDeletePopup} disabled={empty}>Delete</Form.Button>
          </Form.Group>
        </Form>
        <Modal open={deleteConfirm} onClose={this.close} basic size='small'>
          <Header icon='archive' content='Delete Attendance' />
          <Modal.Content>
      <p>Are you sure you want to delete?</p>
    </Modal.Content>
        <Modal.Actions>
      <Button basic color='red' inverted onClick={this.close}>
        <Icon name='remove' /> No
      </Button>
      <Button color='green' inverted onClick={this.delete}>
        <Icon name='checkmark' /> Yes
      </Button>
    </Modal.Actions>
        </Modal>
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
