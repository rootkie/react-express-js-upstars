import React, { Component } from 'react'
import { Form, Message } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'

const req = axios.create({
  baseURL: 'https://test.rootkiddie.com/api/',
  headers: {'Content-Type': 'application/json'}
})

const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const initialState = {
  name: '',
  type: '',
  venue: '',
  dayAndTime: '',
  startDate: '',
  serverErrMessage: '',
  submitSuccess: false
}

class ClassForm extends Component {
  state = {
    ...initialState
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
    let requiredFields = (type === 'Tuition') ? ['name', 'type', 'venue', 'dayAndTime', 'startDate'] : ['name', 'type', 'venue', 'startDate']
    const error = this.checkRequired(requiredFields)

    if (error.length === 0) {
      const data = {
        className: name,
        classType: type,
        venue,
        dayAndTime,
        startDate
      }
      req.post('/class', data)
        .then((response) => {
          this.setState({...initialState, submitSuccess: true}) // reset form
          setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
        })
        .catch((error) => {
          this.setState({serverErrMessage: error.response.data.error}) // display server error message
        })
    } else { // this is to show required field errors
      this.setState({serverErrMessage: 'Please check all required fields are filled in correctly'})
    }
  }

  render () {
    const { name, type, venue, dayAndTime, serverErrMessage, submitSuccess } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='name' value={name} onChange={this.handleChange} required />
          <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='type' value={type} onChange={this.handleChange} required />
          <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={this.handleChange} required />
          <Form.Field required>
            <label>Starting Date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='DD/MM/YYYY'
              selected={this.state.startDate}
              onChange={this.handleDateChange} required />
          </Form.Field>
          <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={this.handleChange} disabled={type === 'Enrichment'} required={type === 'Tuition'} />
          <Form.Button>Submit</Form.Button>
        </Form>
        {serverErrMessage.length > 0 && <Message negative>{serverErrMessage}</Message> }
        {submitSuccess && <Message positive>Class created</Message> }

      </div>
    )
  }
}

export default ClassForm
