import React, { Component } from 'react'
import { Form, Message, Header, Table, Checkbox, Button, Icon, Dropdown } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { object, bool, func } from 'prop-types'
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
  className: '',
  classType: '',
  venue: '',
  dayAndTime: '',
  startDate: '',
  serverErrorMessage: ''
}

// Import the functions declared in ClassWrap here as props to be called - for cleaner code
class ClassForm extends Component {
  static propTypes = {
    classData: object,
    students: object,
    users: object,
    edit: bool,
    editClass: func,
    addClass: func
  }

  // Remove any empty arrays or missing ones I guess.
  filterPropData = (checkArray) => { // consider moving this up to the wrapper
    const { classData } = this.props
    return Object.keys(classData).reduce((last, curr) => (checkArray.includes(curr) ? {...last, [curr]: classData[curr]} : last
  ), {})
  }

  // If classData is present, populate the states to show else just use the initial empty state.
  state = this.props.classData
  ? {
    ...this.filterPropData(['className', 'classType', 'dayAndTime', 'venue']),
    startDate: moment(this.props.classData.startDate),
    error: [],
    stateOptions: [],
    users: this.props.users,
    students: this.props.students,
    submitSuccess: false,
    serverErrorMessage: ''
  }
  : {...initialState, submitSuccess: false}
  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (startDate) => this.setState({startDate})

  // Calling functions when the submit button is clicked
  handleSubmit = async e => {
    e.preventDefault()
    const { className, classType, venue, dayAndTime, startDate } = this.state
    const { edit, editClass, addClass } = this.props
    // check required fields
    let requiredFields = (classType === 'Tuition') ? ['className', 'classType', 'venue', 'dayAndTime', 'startDate'] : ['className', 'classType', 'venue', 'startDate']
    const error = this.checkRequired(requiredFields)

    if (error.length === 0) {
      const data = {
        className,
        classType,
        venue,
        dayAndTime,
        startDate
      }
      // If there is no error and is in edit mode
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
      // From here, this handles then there are errors.
    } else {
      console.log('Incomplete Fields')
      this.setState({error, serverErrorMessage: 'Please check all required fields are filled in correctly'})
    }
  }

  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  render () {
    const { className, classType, venue, dayAndTime, serverErrorMessage, submitSuccess, studentsValue, students, users } = this.state // submitted version are used to display the info sent through POST (not necessary)
    const { edit } = this.props
    return (
      <div>
        <Header as='h3' dividing>Class information</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={className} onChange={this.handleChange} required />
          <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={classType} onChange={this.handleChange} required />
          <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={this.handleChange} required />
          <Form.Field required>
            <label>Starting Date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='DD/MM/YYYY'
              selected={this.state.startDate}
              onChange={this.handleDateChange} required />
          </Form.Field>
          <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={this.handleChange} disabled={classType === 'Enrichment'} required={classType === 'Tuition'} />
          <Form.Button>Submit</Form.Button>
          { edit === true &&
          <div>
            <Header as='h3' dividing>Students</Header>
            <Table compact celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width='1'>Action</Table.HeaderCell>
                  <Table.HeaderCell width='12'>Name</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
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
            </Table>
          </div>
        }
          {serverErrorMessage.length > 0 && <Message negative>{serverErrorMessage}</Message> }
          {submitSuccess && <Message positive>Class created</Message> }
        </Form>
      </div>
    )
  }
}

export default ClassForm
