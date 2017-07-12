import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' }
]

const initialState = {
  /* Student Information */
  fullname: '',
  firstName: '', // Family name
  lastName: '', // Personal name
  studentIC: '',
  dateOfBirth: '',
  nationality: '',
  gender: '',
  address: '', // I don't think we should break the field into such granular sections like name of road, unit number etc
  school: '',
  classLevel: '',

  /* Family Information */
  fatherName: '',
  fatherIC: '',
  fatherNumber: '',
  fatherEmail: '',
  fatherOccupation: '',
  fatherMonthlyIncome: '',
  motherName: '',
  motherIC: '',
  motherNumber: '',
  motherEmail: '',
  motherOccupation: '',
  motherMonthlyIncome: '',
  otherFamilyMembers: '', // object with all the info
  otherName: '',
  otherRelationship: '',
  otherDateOfBirth: '',
  fas: '',
  learningSupport: '',

  /* Terms and conditions */
  terms: false,
  termsDetails: false,

  /* Official use */
  interviewDate: '',
  interviewNotes: '',
  commencementDate: '',
  adminNotes: '',
  dateOfExit: '',
  reasonForExit: '',

  error: []
}

const fieldsArray = ['fullname', 'firstName', 'lastName', 'studentIC', 'dateOfBirth',
  'nationality', 'gender', 'address', 'school', 'classLevel',
  'fatherName', 'fatherIC', 'fatherNumber', 'fatherOccupation', 'fatherMonthlyIncome',
  'motherName', 'motherIC', 'motherNumber', 'motherOccupation', 'motherMonthlyIncome',
  'otherFamilyMembers', 'otherName', 'otherRelationship', 'otherDateOfBirth',
  'fas', 'learningSupport',
  'terms', 'termsDetails',
  'interviewDate', 'interviewNotes', 'commencementDate', 'adminNotes', 'dateOfExit', 'reasonForExit']

class StudentForm extends Component {
  state = {
    ...initialState,
    submitSuccess: false
  }

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error // array of uncompleted required fields
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (dateOfBirth) => this.setState({dateOfBirth})

  handleSubmit = e => {
    e.preventDefault()
    /* submit inputs in fields (stored in state) */
    const { firstName, lastName } = this.state
    console.log(firstName + lastName)
    // Do some wizardry to format data here

    // check required fields
    const error = this.checkRequired(['fullname', 'firstName', 'lastName', 'studentIC', 'dateOfBirth', 'nationality', 'gender', 'address', 'terms'])

    if (error.length === 0) {
      console.log('success') // POST request here

      this.setState({...initialState, submitSuccess: true}) // reset form
      setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
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
    const {
      fullname, firstName, lastName, studentIC, nationality, gender, address, school, classLevel,
      fatherName, fatherIC, fatherNumber, fatherOccupation, fatherMonthlyIncome,
      motherName, motherIC, motherNumber, motherOccupation, motherMonthlyIncome,
      otherFamilyMembers, otherName, otherRelationship, otherDateOfBirth,
      fas, learningSupport,
      terms, termsDetails,
      interviewDate, interviewNotes, commencementDate, adminNotes, dateOfExit, reasonForExit,
      submitSuccess, error
    } = this.state

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='fullname' value={fullname} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Personal name' placeholder='Personal name' name='lastName' value={lastName} onChange={this.handleChange} required />
            <Form.Input label='Family Name' placeholder='Family name' name='firstName' value={firstName} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='studentIC' value={studentIC} onChange={this.handleChange} required />
            <Form.Field required>
              <label>Date of Birth</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={this.state.dateOfBirth}
                onChange={this.handleDateChange} />
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Nationality' placeholder='Nationality' name='nationality' value={nationality} onChange={this.handleChange} required />
            <Form.Select label='Gender' options={genderOptions} placeholder='Select Gender' name='gender' value={gender} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label='Residential address' placeholder='Residential address' name='address' value={address} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Name of School' placeholder='Name of School' name='school' value={school} onChange={this.handleChange} required />
            <Form.Input label='Class level' placeholder='e.g. Pri 1' name='classLevel' value={classLevel} onChange={this.handleChange} required />
          </Form.Group>
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
              <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={this.handleTermsClose} />
            </Modal.Actions>
          </Modal>
          <Form.Button>Submit</Form.Button>
        </Form>
        <Message
          hidden={!submitSuccess}
          success
          content='Submitted'
          />
      </div>
    )
  }
}

export default StudentForm
