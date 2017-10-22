import React, { Component } from 'react'
import { Form, Button, Modal, Header, Table, Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'

const genderOptions = [
  { key: 'male', text: 'Male', value: 'male' },
  { key: 'female', text: 'Female', value: 'female' }
]

const nationalityOptions = [
  {key: 'singapore', text: 'Singapore', value: 'singapore'},
  {key: 'korea', text: 'Korea', value: 'korea'},
  {key: 'australia', text: 'Australia', value: 'australia'},
  {key: 'malaysia', text: 'Malaysia', value: 'malaysia'}
]

const competencesOptions = [
  {key: 'langauges', text: 'Langauges', value: 'languages'},
  {key: 'subjects', text: 'Subjects', value: 'subjects'},
  {key: 'otherInterests', text: 'Other Interests', value: 'otherInterests'}
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
  firstName: '',
  lastName: '',
  address: '',
  mobileNumber: '',
  homeNumber: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  NRICNumber: '',
  fatherName: '',
  fatherOccupation: '',
  fatherEmail: '',
  motherName: '',
  motherOccupation: '',
  motherEmail: '',
  hobbies: '',
  careerGoal: '',

  /* Education / Training */
  formalEducation: [],
  courses: [],
  achievements: [],
  cca: [],
  communityServices: [],
  workExperience: [],
  competences: [],
  purposeToJoin: '',
  developmentalGoals: '',
  intendedDateOfCommencement: '',
  intendedDateOfExit: '',
  preferredTimeslot: [],

  terms: false,
  termsDetails: false,
  error: []
}

class VolunteerForm extends Component {
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

  handleSubmit = e => {
    e.preventDefault()
    // check required fields
    const error = this.checkRequired(['firstName', 'lastName', 'email', 'terms'])

    if (error.length === 0) {
      console.log('success')
      /* POST */

      this.setState(initialState) // reset form
    } else {
      console.log('error occured')
      this.setState({error})
    }
  }

  handleDateChange = (dateType) => (date) => this.setState({[dateType]: date})

  handleTermsOpen = (e) => {
    if (this.state.terms === false) this.setState({termsDetails: true})
  }
  handleTermsClose = (e) => this.setState({termsDetails: false})

  handleRepeatable = (option, field) => (e) => {
    e.preventDefault()
    const updatingArray = this.state[field]
    if (option === 'inc') {
      if (field === 'formalEducation') {
        updatingArray.push({
          startDate: '',
          endDate: '',
          nameOfInstitution: '',
          highestLevel: ''
        })
      } else if (field === 'courses') {
        updatingArray.push({
          year: '',
          courseTitle: ''
        })
      } else if (field === 'achievements') {
        updatingArray.push({
          startDate: '',
          endDate: '',
          nameOfOrganisation: '',
          descriptionOfAward: ''
        })
      } else if (field === 'cca' || field === 'communityServices' || field === 'workExperience') {
        updatingArray.push({
          startDate: '',
          endDate: '',
          nameOfOrganisation: '',
          position: ''
        })
      } else if (field === 'competences') {
        updatingArray.push({
          field: '',
          details: ''
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

  updateRepeatableDateChange = (field, dateType, i) => (date) => {
    const updatingArray = this.state[field]
    updatingArray[i][dateType] = date
    this.setState({[field]: updatingArray})
  }

  handleRepeatableSelectChange = (field, dataType, i) => (e, {name, value}) => {
    const updatingArray = this.state[field]
    updatingArray[i][dataType] = value
    this.setState({[field]: updatingArray})
  }

  render () {
    const { firstName, lastName, address, postalCode, mobileNumber, homeNumber, email, dateOfBirth, gender, nationality, NRICNumber, fatherName, fatherOccupation, fatherEmail, motherName, motherOccupation, motherEmail, hobbies, careerGoal, formalEducation, courses, achievements, cca, communityServices, workExperience, competences, purposeToJoin, developmentalGoals, intendedDateOfCommencement, intendedDateOfExit, termsDetails, error } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Header as='h3' dividing>Personal Particulars</Header>
          <Form.Group widths='equal'>
            <Form.Input label='Name' placeholder='Name' name='firstName' value={firstName} onChange={this.handleChange} required />
            <Form.Input label='Family name' placeholder='Family name' name='lastName' value={lastName} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Address' placeholder='Address' name='address' value={address} onChange={this.handleChange} required />
            <Form.Input label='Postal code' placeholder='Postal code' name='postalCode' value={postalCode} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label='Mobile number' placeholder='Mobile number' name='mobileNumber' value={mobileNumber} onChange={this.handleChange} required />
            <Form.Input label='Home tel' placeholder='Home tel' name='homeNumber' value={homeNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label='Email' placeholder='Email' name='email' value={email} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Date of birth</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='YYYY/MM/DD'
                selected={dateOfBirth}
                onChange={this.handleDateChange('dateOfBirth')}
                isClearable />
            </Form.Field>
            <Form.Select label='Gender' options={genderOptions} placeholder='Gender' name='gender' value={gender} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Select label='Nationality' options={nationalityOptions} placeholder='Nationality' name='nationality' value={nationality} onChange={this.handleChange} required />
            <Form.Input label='NRIC Number' placeholder='NRIC Number' name='NRICNumber' value={NRICNumber} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Input label="Father's name" placeholder="Father's name" name='fatherName' value={fatherName} onChange={this.handleChange} required />
            <Form.Input label="Father's occupation" placeholder="Father's occupation" name='fatherOccupation' value={fatherOccupation} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label="Father's email" type='email' placeholder="Father's email" name='fatherEmail' value={fatherEmail} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label="Mother's name" placeholder="Mother's name" name='motherName' value={motherName} onChange={this.handleChange} required />
            <Form.Input label="Mother's occupation" placeholder="Mother's occupation" name='motherOccupation' value={motherOccupation} onChange={this.handleChange} required />
          </Form.Group>
          <Form.Input label="Mother's email" type='email' placeholder="Mother's email" name='motherEmail' value={motherEmail} onChange={this.handleChange} required />
          <Form.Group widths='equal'>
            <Form.Input label='Your Hobbies' placeholder='Your Hobbies' name='hobbies' value={hobbies} onChange={this.handleChange} required />
            <Form.Input label='Career Goal' name='careerGoal' value={careerGoal} onChange={this.handleChange} required />
          </Form.Group>

          <Header as='h3' dividing>Formal Education</Header>
          <Table celled striped columns={4} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Starting Date</Table.HeaderCell>
                <Table.HeaderCell>Ending Date</Table.HeaderCell>
                <Table.HeaderCell>Name of Institution / School</Table.HeaderCell>
                <Table.HeaderCell>Highest Level / Course</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {formalEducation.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={formalEducation[i].startDate}
                        selectsStart
                        startDate={formalEducation[i].startDate}
                        endDate={formalEducation[i].endDate}
                        onChange={this.updateRepeatableDateChange('formalEducation', 'startDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={formalEducation[i].endDate}
                        selectsEnd
                        startDate={formalEducation[i].startDate}
                        endDate={formalEducation[i].endDate}
                        onChange={this.updateRepeatableDateChange('formalEducation', 'endDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`nameOfInstitution-${i}`} name={`nameOfInstitution-${i}`} value={formalEducation[i].nameOfInstitution} placeholder='Name of Institution' onChange={this.updateRepeatableChange('formalEducation')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`highestLevel-${i}`} name={`highestLevel-${i}`} value={formalEducation[i].highestLevel} placeholder='Highest Level' onChange={this.updateRepeatableChange('formalEducation')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'formalEducation')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'formalEducation')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Courses and seminars</Header>
          <Table celled striped columns={2} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={3}>Year</Table.HeaderCell>
                <Table.HeaderCell width={7}>Course title and Learning Objectives</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {courses.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Input transparent key={`year-${i}`} name={`year-${i}`} value={courses[i].year} placeholder='Year' onChange={this.updateRepeatableChange('courses')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`courseTitle-${i}`} name={`courseTitle-${i}`} value={courses[i].courseTitle} placeholder='Name of Institution' onChange={this.updateRepeatableChange('courses')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='2'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'courses')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'courses')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Achievements</Header>
          <Table celled striped columns={4} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Starting Date</Table.HeaderCell>
                <Table.HeaderCell>Ending Date</Table.HeaderCell>
                <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                <Table.HeaderCell>Description of Award</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {achievements.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={achievements[i].startDate}
                        selectsStart
                        startDate={achievements[i].startDate}
                        endDate={achievements[i].endDate}
                        onChange={this.updateRepeatableDateChange('achievements', 'startDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={achievements[i].endDate}
                        selectsEnd
                        startDate={achievements[i].startDate}
                        endDate={achievements[i].endDate}
                        onChange={this.updateRepeatableDateChange('achievements', 'endDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`nameOfOrganisation-${i}`} name={`nameOfOrganisation-${i}`} value={achievements[i].nameOfOrganisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange('achievements')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`descriptionOfAward-${i}`} name={`descriptionOfAward-${i}`} value={achievements[i].descriptionOfAward} placeholder='Description of Award' onChange={this.updateRepeatableChange('achievements')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'achievements')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'achievements')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Co-Curricular Activities</Header>
          <Table celled striped columns={4} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Starting Date</Table.HeaderCell>
                <Table.HeaderCell>Ending Date</Table.HeaderCell>
                <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                <Table.HeaderCell>Position / Role</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {cca.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={cca[i].startDate}
                        selectsStart
                        startDate={cca[i].startDate}
                        endDate={cca[i].endDate}
                        onChange={this.updateRepeatableDateChange('cca', 'startDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={cca[i].endDate}
                        selectsEnd
                        startDate={cca[i].startDate}
                        endDate={cca[i].endDate}
                        onChange={this.updateRepeatableDateChange('cca', 'endDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`nameOfOrganisation-${i}`} name={`nameOfOrganisation-${i}`} value={cca[i].nameOfOrganisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange('cca')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`position-${i}`} name={`position-${i}`} value={cca[i].position} placeholder='Position' onChange={this.updateRepeatableChange('cca')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'cca')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'cca')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Community Servies</Header>
          <Table celled striped columns={4} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Starting Date</Table.HeaderCell>
                <Table.HeaderCell>Ending Date</Table.HeaderCell>
                <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                <Table.HeaderCell>Position / Role</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {communityServices.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={communityServices[i].startDate}
                        selectsStart
                        startDate={communityServices[i].startDate}
                        endDate={communityServices[i].endDate}
                        onChange={this.updateRepeatableDateChange('communityServices', 'startDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={communityServices[i].endDate}
                        selectsEnd
                        startDate={communityServices[i].startDate}
                        endDate={communityServices[i].endDate}
                        onChange={this.updateRepeatableDateChange('communityServices', 'endDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`nameOfOrganisation-${i}`} name={`nameOfOrganisation-${i}`} value={communityServices[i].nameOfOrganisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange('communityServices')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`position-${i}`} name={`position-${i}`} value={communityServices[i].position} placeholder='Position' onChange={this.updateRepeatableChange('communityServices')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'communityServices')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'communityServices')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Name of Employer / Organisation</Header>
          <Table celled striped columns={4} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Starting Date</Table.HeaderCell>
                <Table.HeaderCell>Ending Date</Table.HeaderCell>
                <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                <Table.HeaderCell>Position / Role</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {workExperience.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={workExperience[i].startDate}
                        selectsStart
                        startDate={workExperience[i].startDate}
                        endDate={workExperience[i].endDate}
                        onChange={this.updateRepeatableDateChange('workExperience', 'startDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Field>
                      <DatePicker
                        selected={workExperience[i].endDate}
                        selectsEnd
                        startDate={workExperience[i].startDate}
                        endDate={workExperience[i].endDate}
                        onChange={this.updateRepeatableDateChange('workExperience', 'endDate', i)}
                        placeholderText='Click to select' />
                    </Form.Field>
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`nameOfOrganisation-${i}`} name={`nameOfOrganisation-${i}`} value={workExperience[i].nameOfOrganisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange('workExperience')} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`position-${i}`} name={`position-${i}`} value={workExperience[i].position} placeholder='Position' onChange={this.updateRepeatableChange('workExperience')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'workExperience')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'workExperience')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>Competences Relevant For Teaching Children</Header>
          <Table celled striped columns={2} fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2}>Field of Competences</Table.HeaderCell>
                <Table.HeaderCell width={8}>Specific Details</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {competences.map((year, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <Form.Select style={{ zIndex: 99999 }} options={competencesOptions} placeholder='Competences' name={`field-${i}`} value={competences[i].field} onChange={this.handleRepeatableSelectChange('competences', 'field', i)} />
                  </Table.Cell>
                  <Table.Cell>
                    <Form.Input transparent key={`details-${i}`} name={`details-${i}`} value={competences[i].details} placeholder='Specific Details' onChange={this.updateRepeatableChange('competences')} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='2'>
                  <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'competences')}>
                    <Icon name='plus' /> Add Year
                  </Button>
                  <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'competences')}>
                    <Icon name='minus' /> Remove Year
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Header as='h3' dividing>My Purpose to Join Stars and My Objectives / Goals</Header>
          <Form.TextArea placeholder='purpose, objectives, goals' name='purposeToJoin' value={purposeToJoin} onChange={this.handleChange} required />

          <Header as='h3' dividing>My Developmental Goals</Header>
          <Form.TextArea placeholder='My personal strengths / weakness / leadership qualities that I would like to
develop from service at Stars' name='developmentalGoals' value={developmentalGoals} onChange={this.handleChange} required />

          <Form.Field>
            <label>Intended Date of Commencement</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={intendedDateOfCommencement}
              onChange={this.handleDateChange('intendedDateOfCommencement')}
              isClearable />
          </Form.Field>
          <Form.Field>
            <label>Intended Date of Exit</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='YYYY/MM/DD'
              selected={intendedDateOfExit}
              onChange={this.handleDateChange('intendedDateOfExit')}
              isClearable />
          </Form.Field>

          <Form.Group inline>
            <label>Date of Preferred Time Slot</label>
            {timeSlotOptions.map((option, i) => {
              return (
                <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handleChange} />
              )
            })}
          </Form.Group>

          <Header as='h3'>Terms and Conditions</Header>
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
      </div>
    )
  }
}

export default VolunteerForm
