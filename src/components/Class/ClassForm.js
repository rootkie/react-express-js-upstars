import React, { Component } from 'react'
import { Form, Message, Header } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { func } from 'prop-types'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'

// Init typeOptions to be used in dropdown for TYPE of class
const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const statusOptions = [
  { key: 'Active', text: 'Active', value: 'Active' },
  { key: 'Stopped', text: 'Stopped', value: 'Stopped' }
]
// Initial State, everything is empty. Will fill it up next.
// StartDate is set to default today.
const initialState = {
  className: '',
  classType: '',
  venue: '',
  dayAndTime: '',
  status: '',
  startDate: moment(),
  submitSuccess: false
}

// Import the functions declared in ClassWrap here as props to be called - for cleaner code
class ClassForm extends Component {
  static propTypes = {
    addClass: func
  }

  // Init the state
  state = {...initialState}

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleDateChange = (startDate) => this.setState({startDate})

  // Calling functions when the submit button is clicked
  handleSubmit = async e => {
    e.preventDefault()
    const { className, classType, venue, dayAndTime, startDate, status } = this.state
    const { addClass } = this.props

    const data = {
      className,
      classType,
      venue,
      dayAndTime,
      startDate,
      status
    }
    if (classType === 'Enrichment') {
      data.dayAndTime = 'nil'
    }

    try {
      await addClass(data)
      // Reset the form back to the initial state.
      this.setState({...initialState})
      this.showSuccess()
    } catch (error) {
      this.setState({serverErrorMessage: error.response.data.error})
    }
  }

  // Function called to show the success message for 3 seconds (UX component)
  // There's still a 'x' button to close the message
  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 3000)
  }

  closeMessage = () => {
    this.setState({submitSuccess: false})
  }

  render () {
    const { className, classType, venue, dayAndTime, submitSuccess, status } = this.state // submitted version are used to display the info sent through POST (not necessary)
    return (
      <div>
        <Header as='h3' dividing>Class information</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={className} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={classType} onChange={this.handleChange} required />
            <Form.Select label='Type' options={statusOptions} placeholder='Status' name='status' value={status} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={this.handleChange} required />
          <Form.Field required>
            <label>Starting Date</label>
            <DatePicker
              inline
              fixedHeight
              dateFormat='DD/MM/YYYY'
              selected={this.state.startDate}
              onChange={this.handleDateChange} required />
          </Form.Field>
          <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={this.handleChange} disabled={classType === 'Enrichment'} required={classType === 'Tuition'} />
          <Form.Button>Submit</Form.Button>
          {submitSuccess && <Message positive onDismiss={this.closeMessage}>Class created</Message> }
        </Form>
      </div>
    )
  }
}

export default ClassForm
