import React, { Component } from 'react'
import { Form, Message, Button, Header, Table, Checkbox, Modal, Dimmer, Loader, Icon, Grid } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { object, array } from 'prop-types'
import axios from 'axios'
import moment from 'moment'

// Initially, edit state is false.
const initialState = {
  date: undefined,
  className: '',
  classId: '',
  type: '',
  hours: '',
  edit: false,
  isLoading: true,
  testClass: [],
  empty: true,
  buttonName: 'Edit',
  deleteConfirm: false
}

// The 3 different types for the Class.
const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' }
]

// Before the details are loaded, default values that if no attendance records are found using that ID.
let students = [{text: 'Not found. Please try another search'}]
let users = [{text: 'Not found. Please try another search'}]

const inlineStyle = {
  modal: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

class AttendanceView extends Component {
  static propTypes = {
    match: object.isRequired,
    classData: array.isRequired,
    roles: array.isRequired
  }
  static contextTypes = {
    router: object.isRequired
  }

  // Handles the getAttendance part: attendanceId from AttendanceWrap as the sid of the URI
  constructor (props) {
    super(props)
    let attendanceId = props.match.params.attendanceId

    this.state = {
      ...initialState,
      users,
      students,
      submitSuccess: false
    }

    if (attendanceId) {
      axios.get('attendance/' + attendanceId)
        .then(response => {
          // More comprehensive error management will be done later.
          // Currently, if you use a random ID string that returns nothing, it simply displays nothing and warns the user that attendance cannot be found
          if (response.data.attendances !== null) {
            let users = []
            let students = []
            let data = response.data.attendances
            if (data.users.length !== 0) {
              for (let [index, userData] of data.users.entries()) {
                users[index] = {
                  text: userData.user.name,
                  key: userData.user._id,
                  user: userData.user._id,
                  status: userData.status
                }
              }
            }
            let testClass = props.classData.map(el => el.text)
            if (data.students.length !== 0) {
              for (let [index, studentData] of data.students.entries()) {
                students[index] = {
                  text: studentData.student.name,
                  key: studentData.student._id,
                  student: studentData.student._id,
                  status: studentData.status
                }
              }
            }
            // Populate the names and stuff. Students and Users are arrays populated previously in the for...of statements.
            // The variable empty is also set to false so that the fields are editable
            this.setState({
              isLoading: false,
              className: data.class.className,
              classId: data.class._id,
              type: data.type,
              hours: data.hours,
              date: moment(data.date),
              users,
              students,
              testClass,
              empty: false
            })
            // Else just remove the loading screen and show the default values
          } else this.setState({ isLoading: false })
        })
        .catch(err => {
          console.log(err)
          this.setState({ isLoading: false })
        })
    }
  }

  handleCheckboxChangeForUser = (e, { name, checked }) => {
    let { users } = this.state
    // Map the users and check which array contains the ID involved. May have performance issues, we would trial that out later.
    // Edit the status accordingly.
    let pos = users.map(usr => { return usr.user }).indexOf(name)
    if (checked) {
      users[pos].status = 1
    } else {
      users[pos].status = 0
    }
    this.setState(users)
  }

  // Similar code logic for students
  handleCheckboxChangeForStudent = (e, { name, checked }) => {
    let { students } = this.state
    let pos = students.map(function (std) { return std.student }).indexOf(name)
    if (checked) {
      students[pos].status = 1
    } else {
      students[pos].status = 0
    }
    this.setState(students)
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleChangeType = (e, { value }) => {
    // Only editable if in edit mode.
    if (this.state.edit === true) {
      this.setState({ type: value })
      // If the classType is changed to class, by default everyone will be ticked as present. Easier to mark and submit attendance.
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
      // Anything else, they will be marked all absent as they are not expected to even come to class.
      // The checkbox will also be disabled.
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
  }

  // Either change to edit mode or to save the edited data.
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
    const { attendanceId } = this.props.match.params
    const { classId } = this.state
    this.setState({isLoading: true, deleteConfirm: false})
    axios.delete('attendance', {
      data: {
        attendanceId: [attendanceId],
        classId
      }
    }).then(response => {
      this.setState({ edit: false, buttonName: 'Edit', submitSuccess: true })
      this.setState({isLoading: false})
      this.context.router.history.push('/attendance/search')
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({isLoading: true})
    const { date, classId, type, students, users, hours } = this.state
    console.table({ date, classId, type, students, users, hours })
    axios.post('attendance', {
      date,
      classId,
      users,
      students,
      hours,
      type
    }).then((response) => {
      this.setState({ edit: false, buttonName: 'Edit', submitSuccess: true, isLoading: false })
    })
  }

  dismiss = () => {
    this.setState({ submitSuccess: false })
  }

  render () {
    const { date, type, className, students, users, submitSuccess, hours, edit, buttonName, deleteConfirm, isLoading, empty, testClass } = this.state // submitted version are used to display the info sent through POST (not necessary)
    const { roles } = this.props
    return (
      <Grid stackable stretched>
        {submitSuccess && <Grid.Row><Grid.Column><Message success onDismiss={this.dismiss}>Submitted</Message></Grid.Column></Grid.Row> }
        <Grid.Row>
          <Grid.Column>
            <Form onSubmit={this.handleEdit}>
              <Form.Group widths='equal'>
                <Form.Input label='Class' placeholder='Name of class' name='className' value={className} onChange={this.handleChange} readOnly required />
                <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={this.handleChangeType} required />
                <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={this.handleChange} readOnly={edit === false} disabled={type !== 'Class'} required={type === 'Class'} />
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Field required>
                  {/* This date is perposely not editable, if dates are to be changed, please delete and create a new one! */}
                  <label>Date of class</label>
                  <DatePicker
                    dateFormat='DD/MM/YYYY'
                    selected={date}
                    readOnly
                  />
                </Form.Field>
              </Form.Group>
              <Dimmer active={isLoading} inverted>
                <Loader indeterminate active={isLoading}>Loading Data</Loader>
              </Dimmer>
              <Header as='h3' dividing>Student Attendance</Header>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {students.map((options, i) => (
                    <Table.Row key={`users-${i}`}>
                      <Table.Cell collapsing>
                        <Checkbox name={options.student} onChange={this.handleCheckboxChangeForStudent} checked={options.status === 1} disabled={type !== 'Class' || edit === false} />
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
                        <Checkbox name={options.user} onChange={this.handleCheckboxChangeForUser} checked={options.status === 1} disabled={type !== 'Class' || edit === false} />
                      </Table.Cell>
                      <Table.Cell>{options.text}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
              </Table>
              {(roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || testClass.indexOf(className) !== -1) &&
              <div>
                <Form.Button fluid floated='left' disabled={empty} value='submit' type='submit'>{buttonName}</Form.Button>
                <Form.Button fluid negative floated='left' onClick={this.handleDeletePopup} disabled={empty}>Delete</Form.Button>
              </div>
              }
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Modal open={deleteConfirm} onClose={this.close} basic size='small' style={inlineStyle.modal}>
          <Header icon='archive' content='Delete Attendance' />
          {/* Just to make sure the user truly wants to delete the attendance since it is permanent. */}
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
      </Grid>
    )
  }
}

export default AttendanceView
