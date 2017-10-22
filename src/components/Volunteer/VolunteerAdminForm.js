import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'

const initialState = {
  userID: '',
  password: '',
  username: '',
  volunteerClassification: '',
  dateActualCommencement: '',
  dateFirstInterview: '',
  dateConfirmationInterview: '',
  adminNotesConfirmation: '',
  adminNotesGeneral: '',
  error: []
}

const volunteerClassificationOptions = [
  { key: 'tutor', text: 'Tutor', value: 'tutor' },
  { key: 'supervisor', text: 'Supervisor', value: 'supervisor' },
  { key: 'mentor', text: 'Mentor', value: 'mentor' },
  { key: 'advisor', text: 'Advisor', value: 'advisor' }
]

class VolunteerAdminForm extends Component {
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

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleSubmit = e => {
    e.preventDefault()
    const { userID, password, username, volunteerClassification, dateActualCommencement, dateFirstInterview, adminNotesConfirmation, adminNotesGeneral } = this.state
    // check required fields
    const error = this.checkRequired(['userID', 'password', 'username'])

    if (error.length === 0) {
      console.log('submit success')
      /* submits sth to server */
      console.table({ userID, password, username, volunteerClassification, dateActualCommencement, dateFirstInterview, adminNotesConfirmation, adminNotesGeneral })

      this.setState(initialState) // reset form
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  handleTermsOpen = (e) => {
    if (this.state.terms === false) this.setState({termsDetails: true})
  }
  handleTermsClose = (e) => this.setState({termsDetails: false})

  render () {
    const { userID, password, username, volunteerClassification, dateActualCommencement, dateFirstInterview, dateConfirmationInterview, adminNotesConfirmation, adminNotesGeneral, error } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='User ID' placeholder='User ID' name='userID' value={userID} onChange={this.handleChange} error={error.includes('userID')} required />
          <Form.Input label='Password' type='password' placeholder='Password' name='password' value={password} onChange={this.handleChange} error={error.includes('password')} required />
          <Form.Input label='User Name' placeholder='username' name='username' value={username} onChange={this.handleChange} error={error.includes('username')} required />
          <Form.Select label='Volunteer Classification' options={volunteerClassificationOptions} placeholder='Volunteer Classification' name='volunteerClassification' value={volunteerClassification} onChange={this.handleChange} required />

          <Form.Field>
            <label>Date of Actual Commencement</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={dateActualCommencement}
              onChange={this.handleDateChange('dateActualCommencement')}
              isClearable />
          </Form.Field>
          <Form.Field>
            <label>Date of First Interview</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={dateFirstInterview}
              onChange={this.handleDateChange('dateFirstInterview')}
              isClearable />
          </Form.Field>
          <Form.Field>
            <label>Date of Confirmation Interview</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={dateConfirmationInterview}
              onChange={this.handleDateChange('dateConfirmationInterview')}
              isClearable />
          </Form.Field>
          <Form.TextArea label='Admin notes for Confirmation' name='adminNotesConfirmation' value={adminNotesConfirmation} onChange={this.handleChange} placeholder='Admin notes for confirmation' />
          <Form.TextArea label='Admin notes (General Purpose)' name='adminNotesGeneral' value={adminNotesGeneral} onChange={this.handleChange} placeholder='Admin notes (General Purpose)' />
          <Form.Button>Submit</Form.Button>
        </Form>
      </div>
    )
  }
}

export default VolunteerAdminForm
