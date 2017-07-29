import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header, Table, Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
// import moment from 'moment'

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

const nationalityOptions = [
  {key: 'singapore', text: 'Singapore', value: 'singapore'},
  {key: 'korea', text: 'Korea', value: 'korea'},
  {key: 'australia', text: 'Australia', value: 'australia'},
  {key: 'malaysia', text: 'Malaysia', value: 'malaysia'}
]

const fasOptions = [
  { key: 'fsc', text: 'Family Service Centre', value: 'Fsc' },
  { key: 'moe', text: 'MOE', value: 'MOE' },
  { key: 'mendaki', text: 'Mendaki', value: 'Mendaki' },
  { key: 'none', text: 'None', value: 'None' }
]

const learningSupportOptions = [
  {value: 'CDAC', text: 'CDAC'},
  {value: 'Mendaki', text: 'Mendaki'},
  {value: 'Private', text: 'Private'},
  {value: 'None', text: 'None'}
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
  fatherCitizenship: '',
  fatherNumber: '',
  fatherEmail: '',
  fatherOccupation: '',
  fatherMonthlyIncome: '',
  motherName: '',
  motherIC: '',
  motherCitizenship: '',
  motherNumber: '',
  motherEmail: '',
  motherOccupation: '',
  motherMonthlyIncome: '',
  otherFamilyMembers: [], // object with all the info
  fas: '',
  fscName: '',
  learningSupport: [],

  /* Terms and conditions */
  terms: false,
  termsDetails: false,
  error: [],
  serverError: ''
}

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

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleLearningSupport = (e, { name, value, checked }) => {
    this.setState({ [name]: checked })
    // lsup for learning support
    let lsup = this.state.learningSupport.slice()
    let i = lsup.indexOf(name)
    if (i === -1) lsup.push(name)
    else lsup.splice(i,1)
    console.log(lsup)
    this.setState({ learningSupport : lsup })
  }

  handleSubmit = e => {
    e.preventDefault()
    /* submit inputs in fields (stored in state) */
    const {
      fullname, firstName, lastName, studentIC, nationality, gender, address, school, classLevel, dateOfBirth,
      fatherName, fatherIC, fatherCitizenship, fatherEmail, fatherNumber, fatherOccupation, fatherMonthlyIncome,
      motherName, motherIC, motherCitizenship, motherEmail, motherNumber, motherOccupation, motherMonthlyIncome,
      otherFamilyMembers,
      fscName, learningSupport,
      termsDetails
    } = this.state
    let { fas } = this.state
    // check required fields
    const error = this.checkRequired(['fullname', 'firstName', 'lastName', 'studentIC', 'dateOfBirth', 'nationality', 'gender', 'address', 'terms'])

    if (error.length === 0) {
    // Do some wizardry to format data here
      
      const newStudent = {
        profile: {
          name: fullname,
          icNumber: studentIC,
          dob: dateOfBirth,
          address,
          gender,
          nationality,
          schoolName: school,
          classLevel
        },
        father: {
          name: fatherName,
          icNumber: fatherIC,
          nationality: fatherCitizenship,
          contactNumber: fatherNumber,
          email: fatherEmail,
          occupation: fatherOccupation,
          income: fatherMonthlyIncome
        },
        mother: {
          name: motherName,
          icNumber: motherIC,
          nationality: motherCitizenship,
          contactNumber: motherNumber,
          email: motherEmail,
          occupation: motherOccupation,
          income: motherMonthlyIncome
        },
        otherFamily: otherFamilyMembers,
        misc: {
          fas,
          fsc: fscName,
          tuition: learningSupport,
        },

      }
      console.log(JSON.stringify(newStudent)) // POST request here
      axios.post('/students', newStudent)
        .then(() => {
          this.setState({...initialState, submitSuccess: true})
          setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
        })
        .catch( err => {
          console.log(err.message)
          this.setState({ serverError : err.response.data })
          setTimeout(() => { this.setState({serverError: ''}) }, 5000)
        })
    } else {
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
      if (field === 'otherFamilyMembers') {
        updatingArray.push({
          name: '',
          relationship: '',
          age: ''
        })
      } else if (field === 'academics') {
        updatingArray.push({
          year: '',
          term: '',
          english: '',
          maths: '',
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

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  updateRepeatableChange = (field) => (e, {name, value}) => {
    const updatingArray = this.state[field]
    const index = name[name.length - 1]
    const property = /\w+(?=-)/.exec(name)[0]
    updatingArray[index][property] = value
    this.setState({[field]: updatingArray})
  }

  render () {
    const {
      fullname, firstName, lastName, studentIC, nationality, gender, address, school, classLevel, dateOfBirth,
      fatherName, fatherIC, fatherCitizenship, fatherEmail, fatherNumber, fatherOccupation, fatherMonthlyIncome,
      motherName, motherIC, motherCitizenship, motherEmail, motherNumber, motherOccupation, motherMonthlyIncome,
      otherFamilyMembers,
      fas, fscName, learningSupport,
      termsDetails,
      
      submitSuccess, error, serverError
    } = this.state

    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Form onSubmit={this.handleSubmit} style={{ marginRight:'10px', padding: '20px', width: '45%', borderColor: 'darkcyan', borderRadius: '5px', borderStyle: 'solid'}}>
          <Header as='h3' dividing>Student Information</Header>
          {/* Student profile */}
          <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='fullname' value={fullname} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Personal name' placeholder='Personal name' name='lastName' value={lastName} onChange={this.handleChange} required />
            <Form.Input label='Family Name' placeholder='Family name' name='firstName' value={firstName} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='studentIC' value={studentIC} onChange={this.handleChange} required />
            <Form.Field error={error.includes('dateOfBirth')} required>
              <label>Date of Birth</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={dateOfBirth}
                onChange={this.handleDateChange('dateOfBirth')} />
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Select label='Nationality' options={nationalityOptions} placeholder='Select Nationality' name='nationality' value={nationality} onChange={this.handleChange} required />
            <Form.Select label='Gender' options={genderOptions} placeholder='Select Gender' name='gender' value={gender} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label='Residential address' placeholder='Residential address' name='address' value={address} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Name of School' placeholder='Name of School' name='school' value={school} onChange={this.handleChange} required />
            <Form.Input label='Class level' placeholder='e.g. Pri 1' name='classLevel' value={classLevel} onChange={this.handleChange} required />
          </Form.Group>
          <Header as='h3' dividing>Family Information</Header>

          {/* Father's information */}
          <Form.Input label="Father's name" placeholder='as in IC card' name='fatherName' value={fatherName} onChange={this.handleChange} />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='fatherIC' value={fatherIC} onChange={this.handleChange} />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='fatherCitizenship' value={fatherCitizenship} onChange={this.handleChange} />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Email' placeholder='abc@example.com' name='fatherEmail' value={fatherEmail} onChange={this.handleChange} />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='fatherNumber' value={fatherNumber} onChange={this.handleChange} />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='fatherOccupation' value={fatherOccupation} onChange={this.handleChange} />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='fatherMonthlyIncome' value={fatherMonthlyIncome} onChange={this.handleChange} />
          </Form.Group>

          {/* Mother's information */}
          <Form.Input label="Mother's name" placeholder='as in IC card' name='motherName' value={motherName} onChange={this.handleChange} />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='motherIC' value={motherIC} onChange={this.handleChange} />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='motherCitizenship' value={motherCitizenship} onChange={this.handleChange} />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Email' placeholder='abc@example.com' name='motherEmail' value={motherEmail} onChange={this.handleChange} />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='motherNumber' value={motherNumber} onChange={this.handleChange} />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='motherOccupation' value={motherOccupation} onChange={this.handleChange} />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='motherMonthlyIncome' value={motherMonthlyIncome} onChange={this.handleChange} />
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
              {otherFamilyMembers.map((member, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={otherFamilyMembers[i].name} placeholder='Name' onChange={this.updateRepeatableChange('otherFamilyMembers')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={otherFamilyMembers[i].relationship} placeholder='Relationship' onChange={this.updateRepeatableChange('otherFamilyMembers')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`age-${i}`} name={`age-${i}`} value={otherFamilyMembers[i].age} placeholder='Age' onChange={this.updateRepeatableChange('otherFamilyMembers')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='3'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'otherFamilyMembers')}>
                    <Icon name='user' /> Add Member
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'otherFamilyMembers')} >
                    <Icon name='user' /> Remove Member
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Form.Group widths='equal'>
            <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='fas' value={fas} onChange={this.handleChange} required />
            {fas === 'Fsc' && <Form.Input label='Name of Family Service Centre' placeholder='name of FSC' name='fscName' value={fscName} onChange={this.handleChange} /> }
          </Form.Group>
          <Form.Group inline>
            <label>Other Learning Support</label>
            {learningSupportOptions.map((option, i) => {
              return (
                <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handleLearningSupport} />
              )
            })}
          </Form.Group>

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
        
        <Message hidden={serverError === ''} negative content={serverError} />

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
