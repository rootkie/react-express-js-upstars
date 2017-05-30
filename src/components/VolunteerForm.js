import React, { Component } from 'react'
import { Form, Message } from 'semantic-ui-react'

const options = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' }
]

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  dateSelect: '',
  aboutInput: '',
  gender: ''
}

class VolunteerForm extends Component {
  state = {
    ...initialState,
    submittedFirstName: '',
    submittedLastName: '',
    submittedEmail: '',
    submittedDate: '',
    submittedAboutInput: '',
    submittedGender: ''
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = e => {
    e.preventDefault()
    const { firstName, lastName, email, dateSelect, aboutInput, gender } = this.state

    this.setState({ submittedFirstName: firstName, submittedLastName: lastName, submittedEmail: email, submittedDate: dateSelect, submittedAboutInput: aboutInput, submittedGender: gender }) // this is just to display the information, in reality a POST request will be sent here

    this.setState(initialState) // reset form
  }

  render () {
    const { dateSelect, firstName, lastName, email, aboutInput, gender, submittedFirstName, submittedLastName, submittedEmail, submittedDate, submittedAboutInput, submittedGender } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths='equal'>
            <Form.Input label='First name' placeholder='First name' name='firstName' value={firstName} onChange={this.handleChange} required />
            <Form.Input label='Last name' placeholder='Last name' name='lastName' value={lastName} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label='Email' type='email' placeholder='name@example.com' name='email' value={email} onChange={this.handleChange} required />
          <Form.Select label='Gender' options={options} placeholder='Gender' name='gender' value={gender} onChange={this.handleChange} required />
          <Form.Group inline>
            <label>Available Date</label>
            <Form.Radio label='Mon' value='mo' checked={dateSelect === 'mo'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Tue' value='tu' checked={dateSelect === 'tu'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Wed' value='we' checked={dateSelect === 'we'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Thu' value='th' checked={dateSelect === 'th'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Fri' value='fr' checked={dateSelect === 'fr'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Sat' value='sa' checked={dateSelect === 'sa'} onChange={this.handleChange} name='dateSelect' />
            <Form.Radio label='Sun' value='su' checked={dateSelect === 'su'} onChange={this.handleChange} name='dateSelect' />
          </Form.Group>
          <Form.TextArea label='About' name='aboutInput' value={aboutInput} onChange={this.handleChange} placeholder='Tell us more about you...' />
          <Form.Checkbox label='I agree to the Terms and Conditions' required /> {/* required does not work. I think it's an issue with semantic-ui-react */}
          <Form.Button>Submit</Form.Button>
        </Form>
        <Message>{JSON.stringify({ submittedFirstName, submittedLastName, submittedEmail, submittedDate, submittedAboutInput, submittedGender }, null, 2)}</Message>
      </div>
    )
  }
}

export default VolunteerForm
