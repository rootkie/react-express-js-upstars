import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Button, Icon, Dropdown, Dimmer, Loader, Grid } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { func, object, array } from 'prop-types'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

// Init typeOptions to be used in dropdown for TYPE of class
const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

// 2 options available for the choosing of class status
const statusOptions = [
  { key: 'Active', text: 'Active', value: 'Active' },
  { key: 'Stopped', text: 'Stopped', value: 'Stopped' }
]

// Initial State, everything is empty. Will fill it up next
// This guide roughly shows the usage of these states:
// 1. oneClassData: the huge array of the entire class DATA
// 2. students / users Value: The array of ids that are to be added to the class
// 3. students / users Selected: The array of ids that are checked, prepared to be deleted.
// 4. Edit Mode is switched off. This determines the look of the page. Once the roles are finished, we can limit the edit function to only Admins
const initialState = {
  oneClassData: [],
  studentsValue: [],
  usersValue: [],
  studentSelected: [],
  userSelected: [],
  isLoading: false,
  edit: false,
  serverErrorMessage: '',
  ButtonContent: 'Edit Class Information'
}

// Import the functions declared in ClassWrap here as props to be called - for cleaner code
// Temp: id is the classID placed in the URI
class ClassEdit extends Component {
  static propTypes = {
    editClass: func,
    match: object.isRequired,
    roles: array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = { ...initialState }
  }
  // Before the component mounts, call the getClass function to retrieve everything about the class.
  componentWillMount () {
    console.log(this.props)
    this.getClass(this.props.match.params.sid)
  }

  getClass = (classId) => {
    this.setState({ isLoading: true })
    axios.get('class/' + classId)
      .then(response => {
        this.setState({ oneClassData: response.data.class, isLoading: false })
      })
      .catch(err => {
        console.log(err)
      })
  }

  // Called only when the user clicks edit (Preparing for various roles)
  getStudentsAndUsers = () => {
    // Get the people as a temp solution for adding them. Could implement real time search later.
    axios.get('students')
      .then(response => {
        let students = []
        for (let [index, studentList] of response.data.students.entries()) {
          students[index] = {
            key: studentList.name,
            text: studentList.name,
            value: studentList._id
          }
        }
        this.setState({ students })
        console.log(students)
      })
      .catch(err => {
        console.log(err)
      })
    axios.get('users')
      .then(response => {
        let users = []
        for (let [index, userList] of response.data.users.entries()) {
          users[index] = {
            key: userList.name,
            text: userList.name,
            value: userList._id
          }
        }
        this.setState({ users })
        console.log(users)
      })
      .catch(err => {
        console.log(err)
      })
  }

  // This is called for usual change handling that concerns the change to the main class array oneClassData
  handleChange = (e, { name, value }) => {
    if (this.state.edit) {
      let { oneClassData } = this.state
      oneClassData[name] = value
      this.setState({ oneClassData })
    }
  }

  // This is to handle change for the special dropdown used to choose people to add to class.
  handleInputChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  // Date handling. Only if in edit mode, the dates would actually change. Else it's readOnly.
  handleDateChange = (startDate) => {
    if (this.state.edit) {
      let oneClassData = this.state.oneClassData
      oneClassData.startDate = startDate
      this.setState({ oneClassData })
    }
  }

  // Calling functions when the submit button is clicked
  handleSubmit = async e => {
    e.preventDefault()
    const { oneClassData, edit } = this.state
    const { editClass } = this.props
    // Change mode to edit, re-render the page, masked using isLoading. 2 seconds shd be sufficient to getAll users and students
    if (!edit) {
      this.getStudentsAndUsers()
      this.setState({ edit: true, isLoading: true, ButtonContent: 'Save edits' })
      setTimeout(() => { this.setState({isLoading: false}) }, 2000)
    } else {
      if (oneClassData.classType === 'Enrichment') {
        oneClassData.dayAndTime = 'nil'
      }
      try {
        // Calls the edit function and if successful change the button and page back to its original form.
        await editClass(oneClassData, this.props.match.params.sid)
        this.showSuccess()
        this.setState({edit: false, ButtonContent: 'Edit Class Information'})
      } catch (error) {
        this.setState({serverErrorMessage: error.response.data.error})
        console.log(error)
      }
    }
  }

  // 2 different checkBox handlers because we need to edit for both students and users
  handleCheckBoxForStudent = (e, { name: _id, checked }) => { // name here is actually _id
    let { studentSelected } = this.state
    if (checked) {
      studentSelected.push(_id)
    } else {
      studentSelected = studentSelected.filter(element => element !== _id)
    }
    this.setState({studentSelected})
  }

  handleCheckBoxForUser = (e, { name: _id, checked }) => { // name here is actually _id
    let { userSelected } = this.state
    if (checked) {
      userSelected.push(_id)
    } else {
      userSelected = userSelected.filter(element => element !== _id)
    }
    this.setState({userSelected})
  }

  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  // API to add user to Class. After adding, the getClass function will call to reinit the state so that the info is accurate
  // The backend ignores any dupicates so even if you try adding the same person twice it doesnt matter.
  addUser = async e => {
    e.preventDefault()
    axios.post('users/class', {
      classId: this.props.match.params.sid,
      userIds: this.state.usersValue
    })
      .then(response => {
        this.getClass(this.props.match.params.sid)
        this.setState({ isLoading: false, submitSuccess: true, usersValue: [] })
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
      })
      .catch(err => {
        console.log(err)
      })
  }

  addStudent = async e => {
    e.preventDefault()
    axios.post('students/class', {
      classId: this.props.match.params.sid,
      studentIds: this.state.studentsValue
    })
      .then(response => {
        this.getClass(this.props.match.params.sid)
        this.setState({ isLoading: false, submitSuccess: true, studentsValue: [] })
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
      })
      .catch(err => {
        console.log(err)
      })
  }
  // Same for delete user in that the getClass function will call again to reinit the state. This is the easiest way to do it other than to refresh
  // the page. Any manual coding would be tough.
  deleteUser = async e => {
    e.preventDefault()
    axios.delete('users/class', {
      data: {
        classId: this.props.match.params.sid,
        userIds: this.state.userSelected
      }
    })
      .then(response => {
        this.getClass(this.props.match.params.sid)
        this.setState({ isLoading: false, submitSuccess: true, userSelected: [] })
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
      })
      .catch(err => {
        console.log(err)
      })
    console.log(this.state.userSelected)
  }

  deleteStudent = async e => {
    axios.delete('students/class', {
      data: {
        classId: this.props.match.params.sid,
        studentIds: this.state.studentSelected
      }
    })
      .then(response => {
        this.getClass(this.props.match.params.sid)
        this.setState({ isLoading: false, submitSuccess: true, studentSelected: [] })
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
      })
      .catch(err => {
        console.log(err)
      })
  }

  render () {
    // Repeated:
    // 1. oneClassData: the huge array of the entire class DATA
    // 2. students / users Value: The array of ids that are to be added to the class
    // 3. students / users Selected: The array of ids that are checked, prepared to be deleted.
    // 4. Edit Mode is switched off. This determines the look of the page. Once the roles are finished, we can limit the edit function to only Admins
    const { roles } = this.props
    const { submitSuccess, oneClassData, isLoading, studentsValue, usersValue, studentSelected, userSelected, students, users, edit, ButtonContent, serverErrorMessage } = this.state // submitted version are used to display the info sent through POST (not necessary)
    // Renders if isLoading is true
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
      return (
        <Grid stackable stretched>
          {serverErrorMessage.length !== 0 &&
          <Grid.Row>
            <Grid.Column>
              <Message
                hidden={serverErrorMessage.length === 0}
                negative
                content={serverErrorMessage}
              />
            </Grid.Column>
          </Grid.Row>
          }
          <Grid.Row>
            <Grid.Column>
              <Header as='h3' dividing>Class information</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Form onSubmit={this.handleSubmit}>
                <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={oneClassData.className} onChange={this.handleChange} readOnly={!edit} required />
                <Form.Group widths='equal'>
                  <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={oneClassData.classType} onChange={this.handleChange} required />
                  <Form.Select label='Status' options={statusOptions} placeholder='Status' name='status' value={oneClassData.status} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={oneClassData.venue} onChange={this.handleChange} readOnly={!edit} required />
                <Form.Field>
                  <label>Starting Date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    dropdownMode='select'
                    selected={moment(oneClassData.startDate)}
                    onChange={this.handleDateChange}
                    required readOnly={!edit} />
                </Form.Field>
                <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={oneClassData.dayAndTime} onChange={this.handleChange} readOnly={!edit} required={oneClassData.classType === 'Tuition'} disabled={oneClassData.classType === 'Enrichment'} />
                {/* Will work on the roles management that only people who own this class or are Admin could use the front-end edit function */}
                {roles.indexOf('SuperAdmin') !== -1 &&
                <Form.Button content={ButtonContent} type='submit' value='Submit' />
                }
                {submitSuccess && <Message positive>Class Updated</Message> }
                <br />
              </Form>
            </Grid.Column>
          </Grid.Row>
          {/* This only renders if edit is true. You can see the delete buttons, the dropdown to input students or users for adding */}
          {(roles.indexOf('SuperAdmin') !== -1 && edit) &&
          <Grid.Row>
            <Grid.Column>
              <Header as='h3' dividing>Students</Header>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width='1'>Action</Table.HeaderCell>
                    <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {oneClassData.students.map((Student, i) => (
                    <Table.Row key={`student-${i}`}>
                      <Table.Cell collapsing>
                        <Checkbox name={Student._id} onChange={this.handleCheckBoxForStudent} checked={studentSelected.includes(Student._id)} />
                      </Table.Cell>
                      <Table.Cell>{Student.name}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>

                <Table.Footer fullWidth>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='4'>
                      <Button floated='right' negative icon labelPosition='left' primary size='small' onClick={this.deleteStudent}>
                        <Icon name='user delete' /> Delete Student(s)
                      </Button>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
              <Dropdown placeholder='Add Students' fluid multiple search selection options={students} name='studentsValue' value={studentsValue} onChange={this.handleInputChange} />
              <br />
              <Button positive fluid onClick={this.addStudent}>Add Students</Button>

              <Header as='h3' dividing>Users</Header>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width='1'>Action</Table.HeaderCell>
                    <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {oneClassData.users.map((User, i) => (
                    <Table.Row key={`user-${i}`}>
                      <Table.Cell collapsing>
                        <Checkbox name={User._id} onChange={this.handleCheckBoxForUser} checked={userSelected.includes(User._id)} />
                      </Table.Cell>
                      <Table.Cell>{User.name}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>

                <Table.Footer fullWidth>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='4'>
                      <Button floated='right' negative icon labelPosition='left' primary size='small' onClick={this.deleteUser}>
                        <Icon name='user delete' /> Delete User(s)
                      </Button>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>

              <Dropdown value={usersValue} placeholder='Add Users' fluid multiple search selection name='usersValue' options={users} onChange={this.handleInputChange} />
              <br />
              <Button positive fluid onClick={this.addUser}>Add Users</Button>
            </Grid.Column>
          </Grid.Row>
          }
          {/* The non-edit mode (view only) offers a light version that is clean to view */}
          {(!edit || roles.indexOf('SuperAdmin') === -1) &&
          <Grid.Row>
            <Grid.Column>
              <Header as='h3' dividing>Students</Header>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width='1'>No.</Table.HeaderCell>
                    <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                {oneClassData.students.length !== 0 &&
                <Table.Body>
                  {oneClassData.students.map((Student, i) => (
                    <Table.Row key={`student-${i}`}>
                      <Table.Cell>{i + 1}</Table.Cell>
                      <Table.Cell>{Student.name}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
                }
                {oneClassData.students.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-student`}>
                    <Table.Cell>1</Table.Cell>
                    <Table.Cell>Oops! No Students Found!</Table.Cell>
                  </Table.Row>
                </Table.Body>
                }
              </Table>

              <Header as='h3' dividing>Users</Header>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width='1'>No.</Table.HeaderCell>
                    <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                {oneClassData.users.length !== 0 &&
                <Table.Body>
                  {oneClassData.users.map((User, i) => (
                    <Table.Row key={`user-${i}`}>
                      <Table.Cell>{i + 1}</Table.Cell>
                      <Table.Cell>{User.name}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
                }
                {oneClassData.users.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-user`}>
                    <Table.Cell>1</Table.Cell>
                    <Table.Cell>Oops! No Volunteers Found!</Table.Cell>
                  </Table.Row>
                </Table.Body>
                }
              </Table>
            </Grid.Column>
          </Grid.Row>}
        </Grid>
      )
    }
  }
}

export default ClassEdit
