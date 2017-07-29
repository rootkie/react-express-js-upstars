import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header, Table, Icon } from 'semantic-ui-react'
import { object, bool, func } from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

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
    dob: '',
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
    contactNumber: '',
    email: '',
    occupation: '',
    income: ''
  },

  mother: {
    name: '',
    icNumber: '',
    nationality: '',
    contactNumber: '',
    email: '',
    occupation: '',
    income: ''
  },

  otherFamily: [], // each object {name, relationship, age}

  misc: {
    fas: '',
    fscName: '',
    tuition: '',
    academicInfo: [] // {year, term, english, math, motherTongue, science, overall}
  },

  /* Official use */
  admin: {
    interviewDate: '',
    interviewNotes: '',
    commencementDate: '',
    adminNotes: '',
    exitDate: '',
    exitReason: ''
  },

  /* Terms and conditions */
  terms: false,
  termsDetails: false,

  tuitionChoices: {
    cdac: false,
    mendaki: false,
    private: false
  },

  error: []
}

class StudentForm extends Component {
  static propTypes = {
    studentData: object,
    edit: bool,
    editStudent: func
  }

  filterPropData = (checkArray) => {
    const { studentData } = this.props
    return Object.keys(studentData).reduce((last, curr) => (checkArray.includes(curr) ? {...last, [curr]: studentData[curr]} : last
  ), {})
  }

  state = this.props.studentData
  ? {
    ...this.filterPropData(['profile', 'father', 'mother', 'otherFamily', 'misc', 'admin']),
    profile: {...this.props.studentData.profile, dob: moment(this.props.studentData.profile.dob)
    }, // reformat dob to moment object

    terms: false,
    termsDetails: false,
    tuitionChoices: {
      CDAC: this.props.studentData.misc.tuition.includes('CDAC') || false,
      Mendaki: this.props.studentData.misc.tuition.includes('Mendaki') || false,
      Private: this.props.studentData.misc.tuition.includes('Private') || false
    },
    submitSuccess: false,
    error: []
  }
  : { ...initialState, submitSuccess: false }

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
    if (childProp) {
      this.setState({
        [parentProp]: {
          ...this.state[parentProp],
          [childProp]: date
        }
      })
    } else {
      this.setState({ [parentProp]: date })
    }
  }

  showSuccess = () => {
    this.setState({...initialState, submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  handleSubmit = e => {
    e.preventDefault()
    /* submit inputs in fields (stored in state) */
    const { profile, father, mother, otherFamily, misc, admin, tuitionChoices, showSuccess } = this.state
    const { edit, editStudent } = this.props

    // check required fields
    const error = this.checkRequired(['profile-name', 'profile-icNumber', 'profile-dob', 'profile-nationality', 'profile-gender', 'profile-address', 'terms'])

    if (error.length === 0) {
    // Do some wizardry to format data here
      let studentDataToSubmit = {
        profile, father, mother, otherFamily, misc, admin
      }
      const tuition = Object.keys(tuitionChoices).reduce((last, curr) => (tuitionChoices[curr] ? last.concat(curr) : last
    ), [])

      studentDataToSubmit.misc = {...studentDataToSubmit.misc, tuition} // adding tuition info into misc

      if (edit) {
        editStudent(studentDataToSubmit)
      } else { // not in edit mode
        axios.post('/students', studentDataToSubmit)
        .then(showSuccess)
        .catch(err => console.log(err))
      }
    } else { // incomplete Field
      console.log('Incomplete Fields')
      this.setState({error})
    }
  }

  handleTermsOpen = (e) => {
    if (this.state.terms === false) this.setState({termsDetails: true})
  }
  handleTermsClose = (e) => this.setState({termsDetails: false})

  handleRepeatable = (option, field) => (e) => {
    e.preventDefault()
    const updatingArray = this.state[field]
    if (option === 'inc') {
      if (field === 'otherFamily') {
        updatingArray.push({
          name: '',
          relationship: '',
          age: ''
        })
      } else if (field === 'academicInfo') {
        updatingArray.push({
          year: '',
          term: '',
          english: '',
          math: '',
          motherTongue: '',
          science: '',
          overall: ''
        })
      }
      this.setState({[field]: updatingArray})
    } else if (option === 'dec') { // remove last item
      this.setState({[field]: updatingArray.slice(0, updatingArray.length - 1)})
    }
  }

  updateRepeatableChange = (field) => (e, {name, value}) => {
    const updatingArray = this.state[field]
    const index = name[name.length - 1]
    const property = /\w+(?=-)/.exec(name)[0]
    updatingArray[index][property] = value
    this.setState({[field]: updatingArray})
  }

  render () {
    const {
      profile, father, mother, otherFamily, misc, admin,
      submitSuccess, tuitionChoices, termsDetails, error
    } = this.state

    const { name, icNumber, dob, address, gender, nationality, classLevel, schoolName } = profile

    const { fas, fscName, academicInfo } = misc

    const { adminNotes, interviewDate, interviewNotes, commencementDate, exitDate, exitReason } = admin

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Header as='h3' dividing>Student Information</Header>
          <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='profile-name' value={name} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='profile-icNumber' value={icNumber} onChange={this.handleChange} required />
            <Form.Field error={error.includes('dateOfBirth')} required>
              <label>Date of Birth</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={dob}
                onChange={this.handleDateChange('profile-dob')} />
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
          <Header as='h3' dividing>Family Information</Header>
          {/* Father's information */}
          <Form.Input label="Father's name" placeholder='as in IC card' name='father-name' value={father.name} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='father-icNumber' value={father.icNumber} onChange={this.handleChange} required />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='father-nationality' value={father.nationality} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Email' placeholder='email' type='email' name='father-email' value={father.email} onChange={this.handleChange} required />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='father-contactNumber' value={father.contactNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='father-occupation' value={father.occupation} onChange={this.handleChange} required />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='father-income' value={father.income} onChange={this.handleChange} required />
          </Form.Group>

          {/* Mother's information */}
          <Form.Input label="Mother's name" placeholder='as in IC card' name='mother-name' value={mother.name} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='mother-icNumber' value={mother.icNumber} onChange={this.handleChange} required />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='mother-nationality' value={mother.nationality} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Email' placeholder='email' type='email' name='mother-email' value={mother.email} onChange={this.handleChange} required />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='mother-contactNumber' value={mother.contactNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='mother-occupation' value={mother.occupation} onChange={this.handleChange} required />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='mother-income' value={mother.income} onChange={this.handleChange} required />
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
                    <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={otherFamily[i].name} placeholder='Name' onChange={this.updateRepeatableChange('otherFamily')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={otherFamily[i].relationship} placeholder='Relationship' onChange={this.updateRepeatableChange('otherFamily')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`age-${i}`} name={`age-${i}`} value={otherFamily[i].age} placeholder='Age' onChange={this.updateRepeatableChange('otherFamily')} />
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

          <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='misc-fas' value={fas} onChange={this.handleChange} multiple required />
          {fas.includes('FSC') && <Form.Input label='Name of Family Service Centre' placeholder='name of FSC' name='misc-fscName' value={fscName} onChange={this.handleChange} /> }
          <Form.Group inline>
            <label>Other Learning Support</label>
            {tuitionOptions.map((option, i) => {
              return (
                <Form.Checkbox label={option.text} key={`option-${i}`} name={`tuitionChoices-${option.value}`} onChange={this.handleChange} checked={tuitionChoices[option.value]} />
              )
            })}
          </Form.Group>

          <Header as='h3' dividing>For Office Use</Header>
          <Form.Field error={error.includes('interviewDate')}>
            <label>Interview date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={interviewDate}
              onChange={this.handleDateChange('admin-interviewDate')}
              isClearable />
          </Form.Field>
          <Form.Input label='Interview notes' placeholder='reason for acceptance' name='admin-interviewNotes' value={interviewNotes} onChange={this.handleChange} />
          <Form.Field error={error.includes('commencementDate')} >
            <label>Commencement date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={commencementDate}
              onChange={this.handleDateChange('admin-commencementDate')}
              isClearable />
          </Form.Field>
          <Form.Input label='Admin notes' placeholder='up to 1000 words' name='admin-adminNotes' value={adminNotes} onChange={this.handleChange} />
          <Form.Field error={error.includes('dateOfExit')} >
            <label>Date of exit</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={exitDate}
              onChange={this.handleDateChange('admin-exitDate')}
              isClearable />
          </Form.Field>
          <Form.Input label='Reason for exit' placeholder='reason for exit' name='admin-exitReason' value={exitReason} onChange={this.handleChange} />

          {/* TODO Student academic information */}
          <Header as='h3' dividing>Student's Academic Information</Header>
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
                    <Form.Input transparent key={`year-${i}`} name={`year-${i}`} value={academicInfo[i].year} placeholder='Year' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`term-${i}`} name={`term-${i}`} value={academicInfo[i].term} placeholder='Term' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`english-${i}`} name={`english-${i}`} value={academicInfo[i].english} placeholder='English' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`math-${i}`} name={`math-${i}`} value={academicInfo[i].math} placeholder='Maths' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`motherTongue-${i}`} name={`motherTongue-${i}`} value={academicInfo[i].motherTongue} placeholder='MotherTongue' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`science-${i}`} name={`science-${i}`} value={academicInfo[i].science} placeholder='Science' onChange={this.updateRepeatableChange('academicInfo')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`overall-${i}`} name={`overall-${i}`} value={academicInfo[i].overall} placeholder='Overall' onChange={this.updateRepeatableChange('academicInfo')} />
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

          {/* terms and conditions */}
          <Form.Checkbox label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} error={error.includes('terms')} />
          <Modal open={termsDetails} onClose={this.close}>
            <Modal.Header>Terms and conditions</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Header>Student rules</Header>
                <p>Ayy lmao</p>
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
        <Message
          hidden={error.length === 0}
          negative
          content='Please Check Required Fields!'
          />
      </div>
    )
  }
}

export default StudentForm
