import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header } from 'semantic-ui-react'

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
  gender: '',
  terms: false,
  termsDetails: false,
  error: []
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

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleSubmit = e => {
    e.preventDefault()
    const { firstName, lastName, email, dateSelect, aboutInput, gender } = this.state
    // check required fields
    const error = this.checkRequired(['firstName', 'lastName', 'email', 'terms'])

    if (error.length === 0) {
      console.log('success')
      this.setState({ submittedFirstName: firstName, submittedLastName: lastName, submittedEmail: email, submittedDate: dateSelect, submittedAboutInput: aboutInput, submittedGender: gender }) // this is just to display the information, in reality a POST request will be sent here

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
    const { dateSelect, firstName, lastName, email, aboutInput, gender, termsDetails, error, submittedFirstName, submittedLastName, submittedEmail, submittedDate, submittedAboutInput, submittedGender } = this.state // submitted version are used to display the info sent through POST (not necessary)

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
          <Form.Checkbox label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} error={error.includes('terms')} />
          <Modal open={termsDetails} onClose={this.close}>
            <Modal.Header>Terms and conditions</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Header>Volunteer rules</Header>
                <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary 3 / Junior Colleges with primary or lower secondary students who need assistance with academic subjects but lack the funding to secure help.</p>
                <p>2. Tutors are expected to be a role model for the tutees, care about their learning outcomes and behaviour, attend the tuition sessions punctually and regularly. In the event that the tutor will be absent from tuition, he/she should advise the Class Mentor and fellow tutors in advance. The programme organizer reserves the right to request the Tutor to leave the programme in the event that he/she exhibits inappropriate behaviour. </p>
                <p>3. A Tutor is expected to serve 12 months with minimum attendance of 70% in order to receive a Certificate of Attendance. Any service period of less than 12 months must be approved by the PCF Vice-Chairman, Ulu Pandan branch prior to the commencement of service. In the exceptional event that tutors have to cease participation in Stars, at least one month’s notice should be given or the organizer reserves the right to deduct service hours from the earned service.</p>
                <p>4. Tutors who made exceptional contributions to the Stars initiative and who have adopted and internalized the Stars selected Harvard competences can ask for testimonials from the programme organizer.</p>
                <p>5. The programme organizer reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button positive icon='checkmark' labelPosition='right' content='I agree' onClick={this.handleTermsClose} />
            </Modal.Actions>
          </Modal>
          <Form.Button>Submit</Form.Button>
        </Form>
        <Message>{JSON.stringify({ submittedFirstName, submittedLastName, submittedEmail, submittedDate, submittedAboutInput, submittedGender }, null, 2)}</Message>
      </div>
    )
  }
}

export default VolunteerForm
