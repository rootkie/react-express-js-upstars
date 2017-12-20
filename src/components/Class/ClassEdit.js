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

const studentsOptions = [
  { key: 'test1', text: 'test1', value: 'test1' },
  { key: 'test2', text: 'test2', value: 'test2' }
]

const usersOptions = [
  { key: 'testtest1', text: 'Male', value: 'Male' },
  { key: 'testtest2', text: 'Female', value: 'testtest1' }
]

// Initial State, everything is empty. Will fill it up next
const initialState = {
  oneClassData: [],
  studentsValue: '',
  usersValue: '',
  studentSelected: [],
  userSelected: [],
  isLoading: false,
  serverErrorMessage: ''
}
/*
axios.get('students', this.state.headerConfig)
.then(response => {
  this.setState({ students: response.data.students })
  console.log(response)
})
// API Call to GET all users
axios.get('users', this.state.headerConfig)
.then(response => {
  this.setState({ users: response.data.users })
  console.log(response)
})
*/
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

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (startDate) => {
    let oneClassData = this.state.oneClassData
    oneClassData.startDate = startDate
    this.setState({oneClassData})
  }

  // Calling functions when the submit button is clicked
  handleSubmit = async e => {
    e.preventDefault()
    const { oneClassData } = this.state
    const { edit, editClass, addClass } = this.props
    // check required fields

    /*
    if (edit) {
      try {
        await editClass(data)
        this.showSuccess()
      } catch (error) {
        this.setState({serverErrorMessage: error.response.data.error})
        console.log(error)
      }
    } else { // not in edit mode
      try {
        await addClass(data)
        this.showSuccess()
        this.setState({...initialState})
      } catch (error) {
        this.setState({serverErrorMessage: error.response.data.error})
      }
    }
    */
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

  render () {
    const { serverErrorMessage, submitSuccess, oneClassData, isLoading, studentsValue, usersValue, studentSelected, userSelected } = this.state // submitted version are used to display the info sent through POST (not necessary)
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
          <Form onSubmit={this.handleSubmit}>
            <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={oneClassData.className} onChange={this.handleChange} readOnly required />
            <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={oneClassData.classType} onChange={this.handleChange} readOnly required />
            <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={oneClassData.venue} onChange={this.handleChange} readOnly required />
            <Form.Field>
              <label>Starting Date</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='DD/MM/YYYY'
                selected={moment(oneClassData.startDate)}
                onChange={this.handleDateChange} required readOnly />
            </Form.Field>
            <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={oneClassData.dayAndTime} onChange={this.handleChange} readOnly />
            {/* Will work on the roles management that only people who own this class or are Admin could use the front-end edit function */}
            <Form.Button>Edit</Form.Button>

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
                      <Button floated='right' negative icon labelPosition='left' primary size='small'>
                        <Icon name='user delete' /> Delete Student(s)
                    </Button>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
              <Dropdown value={studentsValue} placeholder='Add Students' fluid multiple search selection options={studentsOptions} onChange={this.handleChange} />
              <br />
              <Button positive fluid>Add Students</Button>

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
                      <Button floated='right' negative icon labelPosition='left' primary size='small'>
                        <Icon name='user delete' /> Delete User(s)
                    </Button>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>

              <Dropdown value={usersValue} placeholder='Add Users' fluid multiple search selection options={usersOptions} onChange={this.handleChange} />
              <br />
              <Button positive fluid>Add Users</Button>
            </div>
            {serverErrorMessage.length > 0 && <Message negative>{serverErrorMessage}</Message> }
            {submitSuccess && <Message positive>Class Updated</Message> }
          </Form>
        </div>
      )
    }
  }
}

export default ClassEdit
