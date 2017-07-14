import React, { Component } from 'react'
import { Form, Message, Button, Modal, Header, Table, Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'male' },
  { key: 'f', text: 'Female', value: 'female' }
]

const citizenshipOptions = [
  { key: 'citizen', text: 'Singapore Citizen', value: 'citizen' },
  { key: 'pr', text: 'Singapore PR', value: 'pr' },
  { key: 'other', text: 'Other', value: 'other' }
]

const fasOptions = [
  { key: 'fsc', text: 'Family Service Centre', value: 'fsc' },
  { key: 'moe', text: 'MOE', value: 'moe' },
  { key: 'mendaki', text: 'Mendaki', value: 'mendaki' }
]

const learningSupportOptions = [
  {value: 'cdac', text: 'CDAC'},
  {value: 'mendaki', text: 'Mendaki'},
  {value: 'private', text: 'Private'}
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
  otherName: '',
  otherRelationship: '',
  otherDateOfBirth: '',
  fas: '',
  fscName: '',
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

  /* Student's acad */
  year1: '',

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

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleRawDateChange = (dateType) => (value) => {
    console.log(value)
    console.log(moment(value))
    console.log(moment(value).isValid())
    if (!moment(value).isValid()) { this.handleChange(dateType)('') }
  } // fix this

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
      fullname, firstName, lastName, studentIC, nationality, gender, address, school, classLevel, dateOfBirth,
      fatherName, fatherIC, fatherCitizenship, fatherNumber, fatherOccupation, fatherMonthlyIncome,
      motherName, motherIC, motherCitizenship, motherNumber, motherOccupation, motherMonthlyIncome,
      otherFamilyMembers, otherName, otherRelationship, otherDateOfBirth,
      fas, fscName, learningSupport,
      terms, termsDetails,
      interviewDate, interviewNotes, commencementDate, adminNotes, dateOfExit, reasonForExit,
      submitSuccess, error,
      year1
    } = this.state

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Header as='h3' dividing>Student Information</Header>
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
                onChangeRaw={(e) => this.handleRawDateChange('dateOfBirth')(e)}
                onChange={this.handleDateChange('dateOfBirth')} />
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
          <Header as='h3' dividing>Family Information</Header>

          {/* Father's information */}
          <Form.Input label="Father's name" placeholder='as in IC card' name='fatherName' value={fatherName} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='fatherIC' value={fatherIC} onChange={this.handleChange} required />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='fatherCitizenship' value={fatherCitizenship} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='fatherIC' value={fatherIC} onChange={this.handleChange} required />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='fatherNumber' value={fatherNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='fatherOccupation' value={fatherOccupation} onChange={this.handleChange} required />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='fatherMonthlyIncome' value={fatherMonthlyIncome} onChange={this.handleChange} required />
          </Form.Group>

          {/* Mother's information */}
          <Form.Input label="Mother's name" placeholder='as in IC card' name='motherName' value={motherName} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='motherIC' value={motherIC} onChange={this.handleChange} required />
            <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='motherCitizenship' value={motherCitizenship} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Identification Card Number' placeholder='IC number' name='motherIC' value={motherIC} onChange={this.handleChange} required />
            <Form.Input label='Mobile number' placeholder='Mobile number' name='motherNumber' value={motherNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Occupation' placeholder='Occupation' name='motherOccupation' value={motherOccupation} onChange={this.handleChange} required />
            <Form.Input label='Monthly Income' placeholder='Monthly Income' name='motherMonthlyIncome' value={motherMonthlyIncome} onChange={this.handleChange} required />
          </Form.Group>

          {/* adding additional family members (TODO) */}
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
              <Table.Row>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='3'>
                  <Button floated='right' icon labelPosition='left' primary size='small'>
                    <Icon name='user' /> Add Member
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small'>
                    <Icon name='user' /> Remove Member
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Form.Group widths='equal'>
            <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='fas' value={fas} onChange={this.handleChange} required />
            <Form.Input hidden={fas !== 'fsc'} label='Name of Family Service Centre' placeholder='name of FSC' name='fscName' value={fscName} onChange={this.handleChange} />
          </Form.Group>
          <Form.Input label='Other Learning Support' placeholder='Other Learning Support' name='learningSupport' value={learningSupport} onChange={this.handleChange} required />
          <Form.Group inline>
            <label>Other Learning Support</label>
            {learningSupportOptions.map((option, i) => {
              return (
                <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handleChange} />
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
              onChange={this.handleDateChange('interviewDate')}
              isClearable />
          </Form.Field>
          <Form.Input label='Interview notes' placeholder='reason for acceptance' name='interviewNotes' value={interviewNotes} onChange={this.handleChange} />
          <Form.Field error={error.includes('commencementDate')} >
            <label>Commencement date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={commencementDate}
              onChange={this.handleDateChange('commencementDate')}
              isClearable />
          </Form.Field>
          <Form.Input label='Admin notes' placeholder='up to 1000 words' name='adminNotes' value={adminNotes} onChange={this.handleChange} />
          <Form.Field error={error.includes('dateOfExit')} >
            <label>Date of exit</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={dateOfExit}
              onChange={this.handleDateChange('dateOfExit')}
              isClearable />
          </Form.Field>
          <Form.Input label='Reason for exit' placeholder='reason for exit' name='reasonForExit' value={reasonForExit} onChange={this.handleChange} />

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
              <Table.Row>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input transparent placeholder='test' />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='7'>
                  <Button floated='right' icon labelPosition='left' primary size='small'>
                    <Icon name='user' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small'>
                    <Icon name='user' /> Remove Year
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
