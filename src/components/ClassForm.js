import React, { Component } from 'react'
import { Form, Message } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'enrichment' }
]

const initialState = {
  name: '',
  type: '',
  venue: '',
  dayAndTime: '',
  startDate: ''
}

class ClassForm extends Component {
  state = {
    ...initialState,
    submittedName: '',
    submittedType: '',
    submittedVenue: '',
    submittedDayAndTime: '',
    submittedStartDate: ''
  }

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

  handleSubmit = e => {
    e.preventDefault()
    const { name, type, venue, dayAndTime, startDate } = this.state
    // check required fields
    const error = this.checkRequired(['name', 'type', 'venue', 'dayAndTime', 'startDate'])

    if (error.length === 0) {
      console.log('success')
      this.setState({ submittedName: name, submittedType: type, submittedVenue: venue, submittedDayAndTime: dayAndTime, submittedStartDate: moment(startDate).format('DDMMYYYY') }) // this is just to display the information, in reality a POST request will be sent here

      this.setState(initialState) // reset form
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  render () {
    const { name, type, venue, dayAndTime, submittedName, submittedType, submittedVenue, submittedDayAndTime, submittedStartDate } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='name' value={name} onChange={this.handleChange} required />
          <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='type' value={type} onChange={this.handleChange} required />
          <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={this.handleChange} required />
          <Form.Field disabled={type === 'enrichment'} required>
            <label>Starting Date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='DD/MM/YYYY'
              selected={this.state.startDate}
              onChange={this.handleDateChange} />
          </Form.Field>
          <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={this.handleChange} disabled={type === 'enrichment'} required /> {/* may be change to radio */}
          <Form.Button>Submit</Form.Button>
        </Form>
        <Message>{JSON.stringify({ submittedName, submittedType, submittedVenue, submittedDayAndTime, submittedStartDate }, null, 2)}</Message>
      </div>
    )
  }
}

export default ClassForm
