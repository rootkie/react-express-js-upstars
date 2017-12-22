import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Button, Icon, Dropdown, Dimmer, Loader } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { func, string } from 'prop-types'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

// Init typeOptions to be used in dropdown for TYPE of class
const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const statusOptions = [
  { key: 'Active', text: 'Active', value: 'Active' },
  { key: 'Stopped', text: 'Stopped', value: 'Stopped' }
]

// Initial State, everything is empty. Will fill it up next
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
    id: string
  }

  constructor (props) {
    super(props)
    this.state = { ...initialState }
  }

  componentWillMount () {
    this.getClass(this.props.id)
    this.getStudentsAndUsers()
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

  getStudentsAndUsers = () => {
    // Get the people as a temp solution for adding them
    axios.get('students')
      .then(response => {
        let students = []
        for (let [index, studentList] of response.data.students.entries()) {
          students[index] = {
            key: studentList.profile.name,
            text: studentList.profile.name,
            value: studentList._id
          }
        }
        this.setState({ students })
        console.log(students)
      })
      .catch(err => {
        console.log(err)
      })
// API Call to GET all users
    axios.get('users')
      .then(response => {
        let users = []
        for (let [index, userList] of response.data.users.entries()) {
          users[index] = {
            key: userList.profile.name,
            text: userList.profile.name,
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

  handleChange = (e, { name, value }) => {
    let { oneClassData } = this.state
    oneClassData[name] = value
    this.setState({ oneClassData })
  }

  handleInputChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleDateChange = (startDate) => {
    let oneClassData = this.state.oneClassData
    oneClassData.startDate = startDate
    this.setState({ oneClassData })
  }

  // Calling functions when the submit button is clicked
  handleSubmit = async e => {
    e.preventDefault()
    const { oneClassData, edit } = this.state
    const { editClass } = this.props
    if (!edit) {
      this.setState({ edit: true, isLoading: true, ButtonContent: 'Save edits' })
      setTimeout(() => { this.setState({isLoading: false}) }, 1000)
    } else {
      if (oneClassData.classType === 'Enrichment') {
        oneClassData.dayAndTime = 'nil'
      }
      try {
        await editClass(oneClassData)
        this.showSuccess()
        this.setState({edit: false, ButtonContent: 'Edit Class Information'})
      } catch (error) {
        this.setState({serverErrorMessage: error.response.data.error})
        console.log(error)
      }
    }
  }

  handleCheckBox = (e, { name: _id, checked }) => { // name here is actually _id
    let { studentSelected } = this.state
    if (checked) {
      studentSelected.push(_id)
    } else {
      studentSelected = studentSelected.filter(element => element !== _id)
    }
    this.setState({studentSelected})
  }

  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  addUser = async e => {
    e.preventDefault()
    axios.post('users/class', {
      classId: this.props.id,
      userIds: this.state.usersValue
    })
    .then(response => {
      this.getClass(this.props.id)
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
      classId: this.props.id,
      studentIds: this.state.studentsValue
    })
    .then(response => {
      this.getClass(this.props.id)
      this.setState({ isLoading: false, submitSuccess: true, studentsValue: [] })
      setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
    })
    .catch(err => {
      console.log(err)
    })
  }

  deleteUser = async e => {
    e.preventDefault()
  }

  deleteUser = async e => {
    e.preventDefault()
  }

  render () {
    const { submitSuccess, oneClassData, isLoading, studentsValue, usersValue, studentSelected, userSelected, students, users, edit, ButtonContent } = this.state // submitted version are used to display the info sent through POST (not necessary)
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
        <div>
          <Header as='h3' dividing>Class information</Header>
          <Form>
            <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={oneClassData.className} onChange={this.handleChange} readOnly={!edit} required />
            <Form.Group widths='equal'>
              <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={oneClassData.classType} onChange={this.handleChange} readOnly={!edit} required />
              <Form.Select label='Type' options={statusOptions} placeholder='Status' name='status' value={oneClassData.status} onChange={this.handleChange} readOnly={!edit} required />
            </Form.Group>
            <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={oneClassData.venue} onChange={this.handleChange} readOnly={!edit} required />
            <Form.Field>
              <label>Starting Date</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='DD/MM/YYYY'
                selected={moment(oneClassData.startDate)}
                onChange={this.handleDateChange}
                required readOnly={!edit} />
            </Form.Field>
            <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={oneClassData.dayAndTime} onChange={this.handleChange} readOnly={!edit} required={oneClassData.classType === 'Tuition'} disabled={oneClassData.classType !== 'Tuition'} />
            {/* Will work on the roles management that only people who own this class or are Admin could use the front-end edit function */}
            <Form.Button onClick={this.handleSubmit} content={ButtonContent} />
            {submitSuccess && <Message positive>Class Updated</Message> }
            <br />
          </Form>
          {edit &&
          <div>
            <Header as='h3' dividing>Students</Header>
            <Table compact celled>
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
                      <Checkbox name={Student._id} />
                    </Table.Cell>
                    <Table.Cell>{Student.profile.name}</Table.Cell>
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
            <Table compact celled>
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
                      <Checkbox name={User._id} />
                    </Table.Cell>
                    <Table.Cell>{User.profile.name}</Table.Cell>
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
          </div>
          }
          {!edit &&
          <div>
            <Header as='h3' dividing>Students</Header>
            <Table compact celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width='1'>No.</Table.HeaderCell>
                  <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {oneClassData.students.map((Student, i) => (
                  <Table.Row key={`student-${i}`}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>{Student.profile.name}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
            </Table>

            <Header as='h3' dividing>Users</Header>
            <Table compact celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width='1'>No.</Table.HeaderCell>
                  <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {oneClassData.users.map((User, i) => (
                  <Table.Row key={`user-${i}`}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>{User.profile.name}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
            </Table>
          </div>}
        </div>
      )
    }
  }
}

export default ClassEdit
