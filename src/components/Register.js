import React, { Component } from 'react'
import { Form, Button, Modal, Header, Message } from 'semantic-ui-react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { Redirect } from 'react-router'

const rootkiddie = axios.create({
  baseURL: 'https://test.rootkiddie.com/api/',
  headers: {'Content-Type': 'application/json'}
})

const genderOptions = [
  { key: 'male', text: 'Male', value: 'M' },
  { key: 'female', text: 'Female', value: 'F' }
]

const nationalityOptions = [
  {key: 'singapore', text: 'Singapore', value: 'singapore'},
  {key: 'korea', text: 'Korea', value: 'korea'},
  {key: 'australia', text: 'Australia', value: 'australia'},
  {key: 'malaysia', text: 'Malaysia', value: 'malaysia'}
]

const timeSlotOptions = [
  {value: 'mopm', text: 'Monday 7-9.30pm'},
  {value: 'tupm', text: 'Tuesday 7-9.30pm'},
  {value: 'wepm', text: 'Wednesday 7-9.30pm'},
  {value: 'thpm', text: 'Thursday 7-9.30pm'},
  {value: 'frpm', text: 'Friday 7-9.30pm'},
  {value: 'saam', text: 'Saturday 10-12.30pm'}
]

const initialState = {
  email: '',
  password: '',
  cfmpassword: '',
  name: '',
  gender: '',
  dob: '',
  nationality: '',
  nric: '',
  address: '',
  postalCode: '',
  homephone: '',
  handphone: '',
  schoolName: '',
  schoolClass: '',
  schoolLevel: '',
  preferredTimeSlot: [],
  error: [],
  termsDetails: false,
  submitSuccess: false,
  errorMessage: '',
  redirect: false,
}

class Register extends Component {
  state = {...initialState, terms: false} 
  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handlePreferTime = (e, { name, value, checked }) => {
    this.setState({ [name]: checked })
    let preferTime = this.state.preferredTimeSlot.slice()
    if (preferTime.indexOf(name) === -1) preferTime.push(name)
    else preferTime.pop(name)
    this.setState({ preferredTimeSlot : preferTime })
  }


  handleTermsOpen = (e) => {
    if (this.state.terms === false) this.setState({termsDetails: true})
  }

  handleTermsClose = (e) => this.setState({termsDetails: false})

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleSubmit = e => {
    e.preventDefault()
    const { email, password, cfmpassword, name, gender, dob, nationality, nric, address, postalCode, homephone, handphone, 
      schoolName, schoolClass, schoolLevel, commencementDate, exitDate, preferredTimeSlot } = this.state
    // check required fields
    const error = this.checkRequired(['email', 'password', 'name', 'gender', 'dob', 'nationality', 'nric', 'address', 'postalCode', 'homephone', 'handphone', 'commencementDate', 'exitDate', 'terms'])
    if (cfmpassword !== password) error.push("passwords are not the same") // ***may be need to display as a message block***
    if (error.length === 0) {
      const data = {
        email,
        password,
        "profile": {
          name,
          gender,
          dob,
          nationality,
          nric,
          address,
          postalCode,
          homephone,
          handphone,
          schoolName,
          schoolClass,
          schoolLevel
        },
        commencementDate:moment(commencementDate).format('YYYYMMDD'),
        exitDate:moment(exitDate).format('YYYYMMDD'),
        preferredTimeSlot
      }
      console.log(data)
      rootkiddie.post('/register', data)
      .then((response) => {
        console.log(response)
        console.log(response.data.token) // ***should be stored somewhere***
        this.setState({...initialState, submitSuccess: true}) // reset form
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
        this.setState({ redirect:true })
      })
      .catch((error) => {
        console.log(error)
        this.setState({errorMessage: error.response.data.error})
      })
    } else { // incomplete required fields
      console.log('error occured')
      console.log(error)
      this.setState({error, errorMessage: 'Please Check Required Fields!'})
    }
  }

  render () {
    const { email, password, cfmpassword, name, gender, dob, nationality, nric, address, postalCode, homephone, handphone, schoolName, schoolClass, schoolLevel, commencementDate, exitDate, preferredTimeSlot, error, errorMessage, termsDetails, submitSuccess, redirect } = this.state
    if (redirect) {
      return <Redirect to='/home' />
    }
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: '100%'}}>
        <Form onSubmit={this.handleSubmit} style={{ marginRight:'10px', padding: '20px', width: '45%', borderColor: 'darkcyan', borderRadius: '5px', borderStyle: 'solid'}}>
          <Header as='h3' dividing> Volunteer Registration </Header>
          <Form.Input label='Name' placeholder='Surname, Personal name' name='name' value={name} type='username' onChange={this.handleChange} required />
          <Form.Select label='Nationality' options={nationalityOptions} placeholder='Nationality' name='nationality' value={nationality} onChange={this.handleChange} required />
          <Form.Input label='NRIC Number' placeholder='NRIC Number' name='nric' value={nric} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Field>
                <label>Date of birth</label>
                <DatePicker
                  placeholderText='Click to select a date'
                  dateFormat='YYYY/MM/DD'
                  selected={dob}
                  onChange={this.handleDateChange('dob')}
                  isClearable />
            </Form.Field>
            <Form.Select label='Gender' options={genderOptions} placeholder='Gender' name='gender' value={gender} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Address' placeholder='Address' name='address' value={address} onChange={this.handleChange} required />
            <Form.Input label='Postal code' placeholder='Postal code' name='postalCode' value={postalCode} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Mobile number' placeholder='Mobile number' name='handphone' value={handphone} onChange={this.handleChange} required />
            <Form.Input label='Home tel' placeholder='Home tel' name='homephone' value={homephone} onChange={this.handleChange} required />
          </Form.Group>

          <Form.Input label='Email' placeholder='email' name='email' value={email} type='email' onChange={this.handleChange} required />
          <Form.Input label='Password' placeholder='password' name='password' value={password} type='password' onChange={this.handleChange} required />
          <Form.Input label='Confirm Password' placeholder='password' name='cfmpassword' value={cfmpassword} type='password' onChange={this.handleChange} required />
          
          <Form.Group widths='equal'>
            <Form.Field>
                  <label>Intended Commencement Date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='YYYY/MM/DD'
                    selected={commencementDate}
                    onChange={this.handleDateChange('commencementDate')}
                    isClearable />
            </Form.Field>
            <Form.Field>
                  <label>Intended Exit Date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='YYYY/MM/DD'
                    selected={exitDate}
                    onChange={this.handleDateChange('exitDate')}
                    isClearable />
            </Form.Field>
            </Form.Group>
            <Form.Group inline>
              <label>Date of Preferred Time Slot</label>
              {timeSlotOptions.map((option, i) => {
                return (
                  <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handlePreferTime} />
                )
              })}
            </Form.Group>

          <Button type='submit' positive >Register</Button>
          <Form.Checkbox style={{marginTop: '12px'}} label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} error={error.includes('terms')} />
          
          <Modal open={termsDetails} onClose={this.close}>
            <Modal.Header>Terms and conditions</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Header>Volunteer rules</Header>
                <p>Terms and conditions</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={this.handleTermsClose} />
            </Modal.Actions>
          </Modal>
        </Form>
      </div>
    )
  }
}

export default Register
