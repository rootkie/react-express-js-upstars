import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Loader, Dimmer, Grid } from 'semantic-ui-react'
import { array, object } from 'prop-types'
import DatePicker from 'react-datepicker'
import axios from 'axios'

// Note: classSelection is a bool that tracks if any class is provided by the user.
const initialState = {
  date: undefined,
  className: '',
  type: 'Class',
  hours: '',
  isLoading: false,
  classSelection: false,
  error: []
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' }
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

  constructor (props) {
    super(props)
    this.state = {
      ...initialState,
      students,
      users
    }
  }

  // As function name suggests, if the checkbox next to user is checked, it will check for true or false
  // If true, it will find the user among the states using indexOf and change its checked to true and status to 1
  // In state, user `list` field contains IDs.
  // Same goes for Students checkbox
  handleCheckboxChangeForUser = (e, { name, checked }) => {
    let { users } = this.state
    let pos = users.map(usr => { return usr.user }).indexOf(name)
    if (checked) {
      users[pos].status = 1
    } else {
      users[pos].status = 0
    }
    this.setState(users)
  }

  handleCheckboxChangeForStudent = (e, { name, checked }) => {
    let { students } = this.state
    let pos = students.map(std => { return std.student }).indexOf(name)
    if (checked) {
      students[pos].status = 1
    } else {
      students[pos].status = 0
    }
    this.setState(students)
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  // Special function to GET class info based on the one chosen by the user. It sends an API and then loops through the response
  // to categorise the user and student array to put into state in the appropriate forms. After that it sets classSelection and
  // isLoading to be false to stop the loading screen while making the other fields non-disabled for users to key it in.
  handleClass = (e, { value }) => {
    this.setState({ className: value, isLoading: true })
    axios.get('/class/' + value)
      .then(response => {
        let user = []
        let student = []
        for (let [index, studentData] of response.data.class.students.entries()) {
          student[index] = {
            list: studentData._id,
            text: studentData.name,
            key: studentData.name,
            status: 1
          }
        }

        for (let [index, userData] of response.data.class.users.entries()) {
          user[index] = {
            text: userData.name,
            key: userData.name,
            list: userData._id,
            status: 1
          }
        }

        this.setState({ isLoading: false, classSelection: true, users: user, students: student })
      })
      .catch(error => {
        console.log(error)
        this.setState({ isLoading: false, error: 'GOT PROBLEM' })
      })
  }

  // When the type is Class, the default is everyone is present. Else everyone is absent and attendance checkboxes are disabled.
  // Hours are also automatically set to 0 and disabled when type is NOT Class.
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
    } else {
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
  handleSubmit = async e => {
    e.preventDefault()
    const { date, className, type, students, users, hours } = this.state
    // check required fields
    // submits sth to server
    console.table({ date, className, type, students, users, hours })
    try {
      await axios.post('/attendance',
        {
          date,
          classId: className,
          users,
          students,
          hours,
          type
        })
        .then(response => {
          console.log(response)
          this.setState({...initialState, submitSuccess: true})
          this.context.router.history.push(`/dashboard/attendance/view/${response.data.attendanceId}`)
        })
    } catch (err) {
      console.log(err)
      this.setState({ error: 'GOT PROBLEM SUBMITTING ATTENDANCE' })
    }
  }

  render () {
    const { date, type, className, students, users, error, hours, classSelection, isLoading } = this.state
    const { classData } = this.props
    if (isLoading) {
      return (
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
      )
    } else {
      return (
        <Grid stackable stretched>
          <Grid.Row>
            <Grid.Column>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group widths='equal'>
                  <Form.Select label='Class' placeholder='Name of class' name='className' options={classData} search selection minCharacters={0} value={className} onChange={this.handleClass} required />
                  <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={this.handleChangeType} disabled={!classSelection} required />
                  <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={this.handleChange} disabled={type !== 'Class' || !classSelection} required={type === 'Class'} />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Field required>
                    <label>Date of class</label>
                    <DatePicker
                      placeholderText='Click to select a date'
                      dateFormat='DD/MM/YYYY'
                      disabled={!classSelection}
                      selected={date}
                      onChange={this.handleDateChange('date')}
                      required />
                  </Form.Field>
                </Form.Group>
                <Header as='h3' dividing>Student Attendance</Header>
                <Table compact celled unstackable>
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
                          <Checkbox name={options.student} onChange={this.handleCheckboxChangeForStudent} checked={options.status === 1} disabled={type !== 'Class'} />
                        </Table.Cell>
                        <Table.Cell>{options.text}</Table.Cell>
                      </Table.Row>))}
                  </Table.Body>
                </Table>

                <Header as='h3' dividing>User Attendance</Header>

                <Table compact celled unstackable>
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
                          <Checkbox name={options.user} onChange={this.handleCheckboxChangeForUser} checked={options.status === 1} disabled={type !== 'Class'} />
                        </Table.Cell>
                        <Table.Cell>{options.text}</Table.Cell>
                      </Table.Row>))}
                  </Table.Body>
                </Table>

                <Form.Button disabled={!classSelection}>Submit</Form.Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Message
                hidden={error.length === 0}
                negative
                content={error}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
  }
}

export default AttendanceForm
