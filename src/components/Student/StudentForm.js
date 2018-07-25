import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header, Table, Icon, Menu, Segment, Grid } from 'semantic-ui-react'
import { func, object } from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'
import ReCAPTCHA from 'react-google-recaptcha'

let captcha

const genderOptions = [
  { key: 'm', text: 'Male', value: 'M' },
  { key: 'f', text: 'Female', value: 'F' }
]

const citizenshipOptions = [
  { key: 'citizen', text: 'Singapore Citizen', value: 'citizen' },
  { key: 'pr', text: 'Singapore PR', value: 'pr' },
  { key: 'other', text: 'Other', value: 'other' }
]

const fasOptions = [
  { key: 'fsc', text: 'Family Service Centre', value: 'FSC' },
  { key: 'moe', text: 'MOE', value: 'MOE' },
  { key: 'mendaki', text: 'Mendaki', value: 'Mendaki' }
]

const tuitionOptions = [
  {value: 'CDAC', text: 'CDAC'},
  {value: 'Mendaki', text: 'Mendaki'},
  {value: 'Private', text: 'Private'}
]

const initialState = {
  /* Student Information */
  profile: {
    name: '',
    icNumber: '',
    dob: undefined,
    address: '',
    gender: '',
    nationality: '',
    classLevel: '',
    schoolName: ''
  },

  /* Family Information */
  father: {
    name: '',
    icNumber: '',
    nationality: '',
    contactNumber: undefined,
    email: '',
    occupation: '',
    income: undefined
  },

  mother: {
    name: '',
    icNumber: '',
    nationality: '',
    contactNumber: undefined,
    email: '',
    occupation: '',
    income: undefined
  },

  otherFamily: [], // each object {name, relationship, age}

  misc: {
    fas: [],
    fscName: '',
    tuition: [],
    academicInfo: [] // {year, term, english, math, motherTongue, science, overall}
  },

  /* Official use */
  admin: {
    interviewDate: undefined,
    interviewNotes: '',
    commencementDate: undefined,
    adminNotes: '',
    exitDate: undefined,
    exitReason: ''
  },

  /* Terms and conditions */
  terms: false,
  termsDetails: false,

  tuitionChoices: {
    Cdac: false,
    Mendaki: false,
    Private: false
  },

  error: [],
  serverError: false,
  activeItem: 'Personal Info',
  captchaCode: ''
}

// Special CSS to fix the modal bug
const inlineStyle = {
  modal: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

class StudentForm extends Component {
  static propTypes = {
    addStudent: func
  }

  static contextTypes = {
    router: object.isRequired
  }

  state = { ...initialState }

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const iArr = i.split('-')
      const parentProp = iArr[0]
      const childProp = iArr[1]
      const item = childProp ? this.state[parentProp][childProp] : this.state[parentProp]
      if (!item || item === '') error.push(i)
    }
    return error // array of uncompleted required fields
  }

  handleChange = (e, { name, value, checked }) => {
    const nameArr = name.split('-') // ['father', 'name']
    const parentProp = nameArr[0]
    const childProp = nameArr[1]
    if (childProp) {
      this.setState({
        [parentProp]: {
          ...this.state[parentProp],
          [childProp]: value || checked
        }
      })
    } else {
      this.setState({ [parentProp]: value || checked })
    }
  }

  handleDateChange = (dateType) => (date) => {
    const dateTypeArr = dateType.split('-')
    const parentProp = dateTypeArr[0]
    const childProp = dateTypeArr[1]
    this.setState({
      [parentProp]: {
        ...this.state[parentProp],
        [childProp]: date
      }
    })
  }

  showSuccess = (studentId) => {
    this.context.router.history.push(`/students/edit/${studentId}`)
  }

  handleSubmit = async e => {
    e.preventDefault()
    /* submit inputs in fields (stored in state) */
    const { profile, father, mother, otherFamily, misc, admin, tuitionChoices } = this.state
    const { addStudent } = this.props

    // check required fields
    let error = this.checkRequired(['profile-name', 'profile-icNumber', 'profile-dob', 'profile-nationality', 'profile-gender', 'profile-address', 'terms'])

    if (error.length === 0) {
    // Do some wizardry to format data here
      let studentDataToSubmit = {
        profile, father, mother, otherFamily, misc, admin
      }
      // Simply put: Take the keys of tuitonChoices (CDAC, Mendaki, Private) and reduce it
      // if the current value is true, that choice (known as current) would be added to the list of total choices (known as last)
      // else if that option is not checked (false), the list will remain the same (nothing added)
      const tuition = Object.keys(tuitionChoices).reduce((last, current) => (tuitionChoices[current] ? last.concat(current) : last
      ), [])

      studentDataToSubmit.misc = {...studentDataToSubmit.misc, tuition} // adding tuition info into misc

      try {
        let submittedData = await addStudent(studentDataToSubmit)
        // Populate the field so that the user can click the button to proceed to the page.
        this.showSuccess(submittedData._id)
      } catch (error) {
        this.setState({serverError: true})
      }
    } else { // incomplete Field
      console.log('Incomplete Fields')
      error = error.join(', ')
      this.setState({error})
    }
  }

  handleTermsOpen = (e) => {
    captcha.execute()
    if (this.state.terms === false) this.setState({termsDetails: true})
  }

  handleTermsClose = (e) => this.setState({termsDetails: false})

  handleTermsDisagree = e => this.setState({terms: false, termsDetails: false})

  // For the filling in of those fields where user can add / delete accordingly.This functions add / delete a whole row
  // The 2 fields are to be handled separately because they exists in a different state, academicInfo is nested within misc
  handleRepeatable = (option, field) => (e) => {
    e.preventDefault()
    if (option === 'inc') {
      if (field === 'otherFamily') {
        const updatingArray = this.state.otherFamily
        updatingArray.push({
          name: '',
          relationship: '',
          age: undefined
        })
        this.setState({otherFamily: updatingArray})
      } else if (field === 'academicInfo') {
        const updatingArray = this.state.misc.academicInfo
        updatingArray.push({
          year: undefined,
          term: undefined,
          english: undefined,
          math: undefined,
          motherTongue: undefined,
          science: undefined,
          overall: undefined
        })
        let misc = {...this.state.misc}
        misc.academicInfo = updatingArray
        this.setState({misc})
      }
    } else if (option === 'dec') { // remove last item
      if (field === 'otherFamily') this.setState({otherFamily: this.state.otherFamily.slice(0, this.state.otherFamily.length - 1)})
      else if (field === 'academicInfo') {
        let misc = {...this.state.misc}
        misc.academicInfo = misc.academicInfo.slice(0, misc.academicInfo.length - 1)
        this.setState({misc})
      }
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  // This is for handling the individual fields within the repeatables
  updateRepeatableChange = (index, property) => (e, {value}) => {
    const otherFamily = this.state.otherFamily
    otherFamily[index][property] = value
    this.setState({otherFamily})
  }

  updateRepeatableChangeForAcademic = (index, property) => (e, {value}) => {
    let misc = {...this.state.misc}
    misc.academicInfo[index][property] = value
    this.setState({misc})
  }

  // Specially added for captcha validation by Google
  captchaChange = value => {
    this.setState({ captchaCode: value })
  }

  handleCaptchaExpired = () => {
    this.setState({ terms: false, error: 'Timeout, please review and accept the terms again.' })
  }

  render () {
    const {
      profile, father, mother, otherFamily, misc, admin, terms, tuitionChoices, termsDetails, error, serverError, activeItem
    } = this.state

    const { name, icNumber, dob, address, gender, nationality, classLevel, schoolName } = profile

    const { fas, fscName, academicInfo } = misc

    const { adminNotes, interviewDate, interviewNotes, commencementDate, exitDate, exitReason } = admin

    return (
      <Grid stackable stretched>
        <Grid.Row>
          <Grid.Column>
            <Menu attached='top' pointing fluid stackable>
              <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={this.handleItemClick} color={'red'}><Icon name='user' />1. Personal Info</Menu.Item>
              <Menu.Item name='Family Details' active={activeItem === 'Family Details'} onClick={this.handleItemClick} color={'blue'}><Icon name='info circle' />2. Family Info</Menu.Item>
              <Menu.Item name='For office use' active={activeItem === 'For office use'} onClick={this.handleItemClick} color={'orange'}><Icon name='dashboard' />3. For office use</Menu.Item>
            </Menu>
          </Grid.Column>
        </Grid.Row>
        {/* The form only renders part of the form accordingly to the tab selected
        Most of the fields have names of '(parent)-(child)'. This is such that they can be separated easily by the hyphen
        and will be edited accoringly. */}
        <Grid.Row>
          <Grid.Column>
            <Form onSubmit={this.handleSubmit}>
              { activeItem === 'Personal Info' &&
              <Segment attached='bottom'>
                <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='profile-name' value={name} onChange={this.handleChange} required />
                <Form.Group widths='equal'>
                  <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='profile-icNumber' value={icNumber} onChange={this.handleChange} required />
                  <Form.Field error={error.includes('dateOfBirth')} required>
                    <label>Date of Birth</label>
                    <DatePicker
                      placeholderText='Click to select a date'
                      dateFormat='DD/MM/YYYY'
                      showYearDropdown
                      maxDate={moment()}
                      selected={dob}
                      onChange={this.handleDateChange('profile-dob')}
                      required />
                  </Form.Field>
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Nationality' placeholder='Nationality' name='profile-nationality' value={nationality} onChange={this.handleChange} required />
                  <Form.Select label='Gender' options={genderOptions} placeholder='Select Gender' name='profile-gender' value={gender} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Input label='Residential address' placeholder='Residential address' name='profile-address' value={address} onChange={this.handleChange} required />
                <Form.Group widths='equal'>
                  <Form.Input label='Name of School' placeholder='Name of School' name='profile-schoolName' value={schoolName} onChange={this.handleChange} required />
                  <Form.Input label='Class Level' placeholder='e.g. Primary 1' name='profile-classLevel' value={classLevel} onChange={this.handleChange} required />
                </Form.Group>
                <Table celled striped columns={7} fixed>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Year</Table.HeaderCell>
                      <Table.HeaderCell>Term (1/2/3/4)</Table.HeaderCell>
                      <Table.HeaderCell>English (%)</Table.HeaderCell>
                      <Table.HeaderCell>Maths (%)</Table.HeaderCell>
                      <Table.HeaderCell>Mother tongue (%)</Table.HeaderCell>
                      <Table.HeaderCell>Science (%)</Table.HeaderCell>
                      <Table.HeaderCell>OVERALL (%)</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {academicInfo.map((year, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`year-${i}`} name={`year-${i}`} value={academicInfo[i].year} placeholder='Year' onChange={this.updateRepeatableChangeForAcademic(i, 'year')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`term-${i}`} name={`term-${i}`} value={academicInfo[i].term} placeholder='Term' onChange={this.updateRepeatableChangeForAcademic(i, 'term')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`english-${i}`} name={`english-${i}`} value={academicInfo[i].english} placeholder='English' onChange={this.updateRepeatableChangeForAcademic(i, 'english')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`math-${i}`} name={`math-${i}`} value={academicInfo[i].math} placeholder='Maths' onChange={this.updateRepeatableChangeForAcademic(i, 'math')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`motherTongue-${i}`} name={`motherTongue-${i}`} value={academicInfo[i].motherTongue} placeholder='MotherTongue' onChange={this.updateRepeatableChangeForAcademic(i, 'motherTongue')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`science-${i}`} name={`science-${i}`} value={academicInfo[i].science} placeholder='Science' onChange={this.updateRepeatableChangeForAcademic(i, 'science')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`overall-${i}`} name={`overall-${i}`} value={academicInfo[i].overall} placeholder='Overall' onChange={this.updateRepeatableChangeForAcademic(i, 'overall')} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan='7'>
                        <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'academicInfo')}>
                          <Icon name='plus' /> Add Year
                        </Button>
                        <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'academicInfo')}>
                          <Icon name='minus' /> Remove Year
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                </Table>
              </Segment>
              }
              { activeItem === 'Family Details' &&
              <Segment attached='bottom'>
                {/* Father's information */}
                <Form.Input label="Father's name" placeholder='as in IC card' name='father-name' value={father.name} onChange={this.handleChange} />
                <Form.Group widths='equal'>
                  <Form.Input label='Identification Card Number' placeholder='IC number' name='father-icNumber' value={father.icNumber} onChange={this.handleChange} />
                  <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='father-nationality' value={father.nationality} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Email' placeholder='email' type='email' name='father-email' value={father.email} onChange={this.handleChange} />
                  <Form.Input type='number' label='Mobile number' placeholder='Mobile number' name='father-contactNumber' value={father.contactNumber} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Occupation' placeholder='Occupation' name='father-occupation' value={father.occupation} onChange={this.handleChange} />
                  <Form.Input type='number' label='Monthly Income' placeholder='Monthly Income' name='father-income' value={father.income} onChange={this.handleChange} />
                </Form.Group>

                {/* Mother's information */}
                <Form.Input label="Mother's name" placeholder='as in IC card' name='mother-name' value={mother.name} onChange={this.handleChange} />
                <Form.Group widths='equal'>
                  <Form.Input label='Identification Card Number' placeholder='IC number' name='mother-icNumber' value={mother.icNumber} onChange={this.handleChange} />
                  <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='mother-nationality' value={mother.nationality} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Email' placeholder='email' type='email' name='mother-email' value={mother.email} onChange={this.handleChange} />
                  <Form.Input type='number' label='Mobile number' placeholder='Mobile number' name='mother-contactNumber' value={mother.contactNumber} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Occupation' placeholder='Occupation' name='mother-occupation' value={mother.occupation} onChange={this.handleChange} />
                  <Form.Input type='number' label='Monthly Income' placeholder='Monthly Income' name='mother-income' value={mother.income} onChange={this.handleChange} />
                </Form.Group>

                {/* adding additional family members */}
                <Table celled striped columns={3} fixed>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan='3'>Other family members in the same household</Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Relationship</Table.HeaderCell>
                      <Table.HeaderCell>Age</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {otherFamily.map((member, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>
                          <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={otherFamily[i].name} placeholder='Name' onChange={this.updateRepeatableChange(i, 'name')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={otherFamily[i].relationship} placeholder='Relationship' onChange={this.updateRepeatableChange(i, 'relationship')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input type='number' transparent key={`age-${i}`} name={`age-${i}`} value={otherFamily[i].age} placeholder='Age' onChange={this.updateRepeatableChange(i, 'age')} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan='3'>
                        <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'otherFamily')}>
                          <Icon name='user' /> Add Member
                        </Button>
                        <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'otherFamily')} >
                          <Icon name='user' /> Remove Member
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                </Table>

                <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='misc-fas' value={fas} onChange={this.handleChange} multiple />
                {fas.includes('FSC') && <Form.Input label='Name of Family Service Centre' placeholder='name of FSC' name='misc-fscName' value={fscName} onChange={this.handleChange} /> }
                <Form.Group inline>
                  <label>Other Learning Support</label>
                  {tuitionOptions.map((option, i) => {
                    return (
                      <Form.Checkbox label={option.text} key={`option-${i}`} name={`tuitionChoices-${option.value}`} onChange={this.handleChange} checked={tuitionChoices[option.value]} />
                    )
                  })}
                </Form.Group>
              </Segment>
              }
              { activeItem === 'For office use' &&
              <Segment attached='bottom'>
                <Form.Field error={error.includes('interviewDate')}>
                  <label>Interview date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    selected={interviewDate}
                    onChange={this.handleDateChange('admin-interviewDate')}
                  />
                </Form.Field>
                <Form.Input label='Interview notes' placeholder='reason for acceptance' name='admin-interviewNotes' value={interviewNotes} onChange={this.handleChange} />
                <Form.Field error={error.includes('commencementDate')} >
                  <label>Commencement date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    minDate={interviewDate}
                    selected={commencementDate}
                    onChange={this.handleDateChange('admin-commencementDate')}
                  />
                </Form.Field>
                <Form.Input label='Admin notes' placeholder='up to 1000 words' name='admin-adminNotes' value={adminNotes} onChange={this.handleChange} />
                <Form.Field error={error.includes('dateOfExit')} >
                  <label>Date of exit</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    minDate={commencementDate}
                    selected={exitDate}
                    onChange={this.handleDateChange('admin-exitDate')}
                  />
                </Form.Field>
                <Form.Input label='Reason for exit' placeholder='reason for exit' name='admin-exitReason' value={exitReason} onChange={this.handleChange} />
              </Segment>
              }

              {/* terms and conditions */}
              <Form.Checkbox label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} checked={terms} />
              <Modal open={termsDetails} onClose={this.close} dimmer='blurring' size='fullscreen' style={inlineStyle.modal}>
                <Modal.Header>Terms and conditions</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <Header>Welcome to Ulu Pandan STARS</Header>
                    <p>Thanks for choosing Ulu Pandan STARS. This service is provided by Ulu Pandan STARS ("UPSTARS"), located at Block 3 Ghim Moh Road, Singapore.
                   By signing up for a student, you are agreeing to these terms. <b>Please read them carefully.</b></p>
                    <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary 3 / Junior Colleges with primary
                   or lower secondary students who need assistance with academic subjects but lack the funding to secure help. </p>
                    <p>2. As you are creating an account on behalf of a student, please ensure that all information filled are correct as it represent the student. You, the admin, should take
                  all responsibility for any wrong information entered that may impact the student's prospect of being able to be accepted into UPStars.
                    </p>
                    <p>3. The programme organizer reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
                    <p>4. I To the best of my knowledge, the information contained herein is accurate and reliable as of the date of submission.</p>
                    <Header>Terms and Conditions</Header>
                    <p>Last modified: June 1, 2017</p>
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
                content={`Please Check Required Fields - ${error}`}
              />
              <Message
                hidden={!serverError}
                negative
                content='Server Error'
              />
              <Form.Button type='submit'>Add student</Form.Button>
              <ReCAPTCHA
                ref={(el) => { captcha = el }}
                size='invisible'
                sitekey='6LdCS1IUAAAAAHaYU_yJyFimpPuJShH-i80kFj3F' // Dev key under Ying Keat's account (yingkeatwon@gmail.com)
                onChange={this.captchaChange}
                onExpired={this.handleCaptchaExpired}
              />
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default StudentForm
