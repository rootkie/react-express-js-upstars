import React, { Component } from 'react'
import { Form, Button, Modal, Header, Icon, Menu, Segment, Image, Message } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'

let captcha

const genderOptions = [
  { key: 'male', text: 'Male', value: 'M' },
  { key: 'female', text: 'Female', value: 'F' }
]

const nationalityOptions = [
  {key: 'singaporean', text: 'Singaporean', value: 'singaporean'},
  {key: 'korean', text: 'Korean', value: 'korean'},
  {key: 'australian', text: 'Australian', value: 'australian'},
  {key: 'malaysian', text: 'Malaysian', value: 'malaysian'}
]

const timeSlotOptions = [
  {value: 'Monday 7-9.30pm', text: 'Monday 7-9.30pm'},
  {value: 'Tuesday 7-9.30pm', text: 'Tuesday 7-9.30pm'},
  {value: 'Wednesday 7-9.30pm', text: 'Wednesday 7-9.30pm'},
  {value: 'Thursday 7-9.30pm', text: 'Thursday 7-9.30pm'},
  {value: 'Friday 7-9.30pm', text: 'Friday 7-9.30pm'},
  {value: 'Saturday 10-12.30pm', text: 'Saturday 10-12.30pm'},
  {value: 'Saturday 12.15-1.15pm', text: 'Saturday 12.15-1.15pm'},
  {value: 'Saturday 12.00-2.30pm', text: 'Saturday 12.00-2.30pm'}
]

const initialState = {
  name: '',
  password: '',
  address: '',
  handphone: '',
  postalCode: '',
  homephone: '',
  email: '',
  dob: '',
  gender: '',
  nationality: '',
  nric: '',
  careerGoal: '',
  schoolClass: '',
  schoolLevel: '',
  commencementDate: '',
  exitDate: '',
  preferredTimeSlot: {
    'Monday 7-9.30pm': false,
    'Tuesday 7-9.30pm': false,
    'Wednesday 7-9.30pm': false,
    'Thursday 7-9.30pm': false,
    'Friday 7-9.30pm': false,
    'Saturday 10-12.30pm': false,
    'Saturday 12.15-1.15pm': false,
    'Saturday 12.00-2.30pm': false
  },

  terms: false,
  termsDetails: false,
  error: [],
  activeItem: 'Login Details',
  captchaCode: '',
  errorMessage: ''
}

class Register extends Component {
  state = {
    ...initialState,
    success: false
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

  handleChangeCheckBox = (e, { name, checked }) => {
    this.setState({
      preferredTimeSlot: {
        ...this.state.preferredTimeSlot,
        [name]: checked
      }
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    // check required fields
    const error = this.checkRequired(['terms', 'preferredTimeSlot', 'name', 'address', 'postalCode',
      'handphone', 'homephone', 'email', 'dob', 'gender', 'nric', 'password', 'schoolLevel', 'schoolClass', 'captchaCode',
      'commencementDate', 'exitDate'])

    const { name, address, postalCode, handphone, homephone, email, dob, gender, nationality, nric, password, schoolLevel, schoolClass,
      preferredTimeSlot, commencementDate, exitDate, captchaCode } = this.state

    if (error.length === 0) {
      let volunteerData = {
        email,
        password,
        commencementDate,
        exitDate,
        preferredTimeSlot,
        profile: {
          name,
          dob,
          gender,
          nationality,
          nric,
          address,
          postalCode,
          handphone,
          homephone,
          schoolClass,
          schoolLevel
        },
        captchaCode
      }

      const timeSlot = Object.keys(preferredTimeSlot).reduce((last, curr) => (preferredTimeSlot[curr] ? last.concat(curr) : last), [])
      volunteerData.preferredTimeSlot = timeSlot

      axios.post('/register', volunteerData)
        .then(response => {
          // put token inside and log in but not done yet..
          console.log(response)
          this.setState({...initialState, success: true}) // reset form
        })
        .catch((err) => {
          console.log(err)
          this.setState({errorMessage: err.response.data.error})
        })
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleTermsOpen = (e) => {
    captcha.execute()
    if (this.state.terms === false) this.setState({termsDetails: true})
  }
  handleTermsClose = (e) => this.setState({termsDetails: false})

  handleTermsDisagree = e => this.setState({terms: false, termsDetails: false})

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  captchaChange = value => {
    this.setState({ captchaCode: value })
  }

  render () {
    const { name, address, postalCode, handphone, homephone, email, dob, gender, nationality, nric, password, schoolLevel, schoolClass,
      preferredTimeSlot, success, commencementDate, exitDate, terms, termsDetails, error, activeItem, errorMessage } = this.state

    return (
      <div style={{ 'margin': '1.5em' }}>
        <Image size='small' centered src={require('./../logo.png')} />
        <Header as='h1' color='blue' textAlign='center'>
              Sign up as a volunteer
        </Header>
        <Menu attached='top' tabular widths={2} inverted>
          <Menu.Item name='Login Details' active={activeItem === 'Login Details'} onClick={this.handleItemClick} color={'red'}><Icon name='lock' />Login Details*</Menu.Item>
          <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={this.handleItemClick} color={'blue'}><Icon name='user' />Personal Info*</Menu.Item>
        </Menu>
        <Form onSubmit={this.handleSubmit}>
          {activeItem === 'Login Details' &&
          <Segment attached='bottom'>
            <Form.Input label='Email' placeholder='Email' name='email' value={email} onChange={this.handleChange} required type='email' />
            <Form.Input label='Password' placeholder='Password' name='password' value={password} onChange={this.handleChange} required type='password' />
          </Segment>
          }
          { activeItem === 'Personal Info' &&
          <Segment attached='bottom'>
            <Form.Group widths='equal'>
              <Form.Input label='Name' placeholder='Name' name='name' value={name} onChange={this.handleChange} required />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input label='Address' placeholder='Address' name='address' value={address} onChange={this.handleChange} required />
              <Form.Input label='Postal code' placeholder='Postal code' name='postalCode' value={postalCode} onChange={this.handleChange} type='number' required />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input label='School' placeholder='E.G. UPStars Secondary School' name='schoolLevel' value={schoolLevel} onChange={this.handleChange} required />
              <Form.Input label='Class level - name' placeholder='E.G. Sec 3-1' name='schoolClass' value={schoolClass} onChange={this.handleChange} required />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Input label='Mobile number' placeholder='Mobile number' name='handphone' value={handphone} onChange={this.handleChange} type='number' required />
              <Form.Input label='Home tel' placeholder='Home tel' name='homephone' value={homephone} onChange={this.handleChange} required type='number' />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Field>
                <label>Date of birth</label>
                <DatePicker
                  placeholderText='Click to select a date'
                  dateFormat='DD/MM/YYYY'
                  showYearDropdown
                  selected={dob}
                  onChange={this.handleDateChange('dob')}
                  required />
              </Form.Field>
              <Form.Select label='Gender' options={genderOptions} placeholder='Gender' name='gender' value={gender} onChange={this.handleChange} required />
            </Form.Group>
            <Form.Group widths='equal'>
              <Form.Select label='Nationality' options={nationalityOptions} placeholder='Nationality' name='nationality' value={nationality} onChange={this.handleChange} required />
              <Form.Input label='NRIC Number' placeholder='NRIC Number' name='nric' value={nric} onChange={this.handleChange} required />
            </Form.Group>
          </Segment>
          }
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Intended Date of Commencement</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='DD/MM/YYYY'
                selected={commencementDate}
                onChange={this.handleDateChange('commencementDate')}
                required />
            </Form.Field>
            <Form.Field>
              <label>Intended Date of Exit</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='DD/MM/YYYY'
                selected={exitDate}
                onChange={this.handleDateChange('exitDate')}
                minDate={commencementDate}
                required />
            </Form.Field>
          </Form.Group>
          <Form.Group inline>
            <label>Date of Preferred Time Slot *</label>
            {timeSlotOptions.map((option, i) => {
              return (
                <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handleChangeCheckBox} checked={preferredTimeSlot[option.value]} />
              )
            })}
          </Form.Group>

          <Header as='h3'>Terms and Conditions</Header>
          <Form.Checkbox label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} checked={terms} />
          <Modal open={termsDetails} onClose={this.close} dimmer='blurring' size='fullscreen'>
            <Modal.Header>Terms and conditions</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Header>Welcome to Ulu Pandan STARS</Header>
                <p>Thanks for choosing Ulu Pandan STARS. This service is provided by Ulu Pandan STARS ("UPSTARS"), located at Block 3 Ghim Moh Road, Singapore.
                   By signing up as a volunteer, you are agreeing to these terms. <b>Please read them carefully.</b></p>
                <Header>Volunteer rules</Header>
                <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary Schools or Junior Colleges with primary or lower secondary students who need assistance with academic subjects but lack the funding to secure help. </p>
                <p>2. Tutors are expected to be a role model for the tutees, care about their learning outcomes and behaviour, attend the tuition sessions punctually and regularly. In the event that the tutor will be absent from tuition, he/she should advise the Class Mentor and fellow tutors in advance. The programme organizer reserves the right to request the Tutor to leave the programme in the event that he/she exhibits undesirable behaviour. </p>
                <p>3. A Tutor is expected to serve <b>12 months with minimum attendance of 70%</b> in order to receive a Certificate of Attendance. Any service period of less than 12 months must be approved by the Programme Director prior to the commencement of service. In the exceptional event that tutors have to cease participation in Stars, at least one month’s notice should be given or the organizer reserves the right to deduct service hours from the earned service.
                   A tutor may be requested to leave the programme if he/she attendance rate is irregular and unsatisfactory.</p>
                <p>4. Tutors who made exceptional contributions to the Stars initiative and who have adopted and internalized the Stars selected Harvard competences*** can ask for testimonials from the Programme Director. (Note*** : google for Harvard competency dictionary for information)</p>
                <p>5. The Stars programme reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
                <p>6. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
                    You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.</p>
                <p>7. Users provide their real names and information, and we need your help to keep it that way. Here are some commitments you make to us relating to registering and maintaining the security of your account:</p>
                <p>&emsp; a. You will not provide any false personal information, or create an account for anyone other than yourself without permission.</p>
                <p>&emsp; b. You will not create more than one personal account.</p>
                <p>&emsp; c. If we disable your account, you will not create another one without our permission.</p>
                <p>&emsp; d. I To the best of my knowledge, the information contained herein is accurate and reliable as of the date of submission.</p>
                <Header>Terms and Conditions</Header>
                <p>Last modified: June 17, 2017</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button negative icon='close' labelPosition='right' content='I DISAGREE' onClick={this.handleTermsDisagree} />
              <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={this.handleTermsClose} />
            </Modal.Actions>
          </Modal>
          <Message
            hidden={error.length === 0}
            negative
            content='Please Check Required Fields!'
          />
          <Message
            hidden={success === false}
            positive
            content='Success! Please check your email for verification link'
          />
          <Message
            hidden={errorMessage.length === 0}
            color='orange'
            content={errorMessage}
          />
          <Form.Button>Register as volunteer</Form.Button>
          <ReCAPTCHA
            ref={(el) => { captcha = el }}
            size='invisible'
            sitekey='6LdCS1IUAAAAAHaYU_yJyFimpPuJShH-i80kFj3F' // Dev key under Ying Keat's account (yingkeatwon@gmail.com)
            onChange={this.captchaChange}
          />
        </Form>
      </div>
    )
  }
}
export default Register
