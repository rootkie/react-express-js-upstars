import React, { Component } from 'react'
import { Form, Message, Header } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { func } from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router-dom'
import 'react-datepicker/dist/react-datepicker.css'

// Init typeOptions to be used in dropdown for TYPE of class
const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

// Initial State, everything is empty. Will fill it up next.
// StartDate is set to default today.
const initialState = {
  className: '',
  classType: 'Tuition',
  venue: '',
  dayAndTime: '',
  classId: '',
  startDate: moment(),
  submitSuccess: false,
  serverErrorMessage: ''
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
    const { className, classType, venue, dayAndTime, startDate } = this.state
    const { addClass } = this.props

    const data = {
      className,
      classType,
      venue,
      dayAndTime,
      startDate
    }
    if (classType === 'Enrichment') {
      data.dayAndTime = 'nil'
    }

    try {
      let classData = await addClass(data)
      // console.log(classData)
      // Reset the form back to the initial state. This also populates the classID so that the user can click on the link to be directed immediately.
      this.setState({...initialState, classId: classData.data.newClass._id})
      this.showSuccess()
    } catch (err) {
      this.setState({serverErrorMessage: err.response.data.error})
    }
  }

  // Function called to show the success message for 5 seconds (UX component)
  // There's still a 'x' button to close the message
  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  closeMessage = () => {
    this.setState({submitSuccess: false})
  }

  render () {
    const { className, classType, venue, dayAndTime, submitSuccess, classId, serverErrorMessage } = this.state // submitted version are used to display the info sent through POST (not necessary)
    return (
      <div>
        {submitSuccess && <Message positive onDismiss={this.closeMessage}>Class created. <Link to={'id/' + classId}>Click here to view it.</Link></Message> }
        <Message
          hidden={serverErrorMessage.length === 0}
          negative
          content={serverErrorMessage}
        />
        <Header as='h3' dividing>Class information</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={className} onChange={this.handleChange} required />
          <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={classType} onChange={this.handleChange} required />
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
        </Form>
      </div>
    )
  }
}

export default ClassForm
