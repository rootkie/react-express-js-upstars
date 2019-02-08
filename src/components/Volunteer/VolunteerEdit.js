import React, { Component } from 'react'
import { Form, Button, Header, Table, Icon, Menu, Segment, Message, Dimmer, Loader, Modal, Grid } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { Link } from 'react-router-dom'
import { array, object } from 'prop-types'
import axios from 'axios'
import moment from 'moment'

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
  address: '',
  handphone: '',
  postalCode: '',
  homephone: '',
  fatherName: '',
  fatherOccupation: '',
  fatherEmail: '',
  motherName: '',
  motherOccupation: '',
  motherEmail: '',
  hobbies: '',
  careerGoal: '',
  schoolClass: '',
  schoolLevel: '',
  interviewDate: undefined,
  interviewNotes: '',
  adminNotes: '',
  realCommencementDate: undefined,

  /* Education / Training */
  formalEducation: [],
  coursesSeminar: [],
  achievements: [],
  cca: [],
  cip: [],
  workInternExp: [],
  competence: [{
    languages: [''],
    subjects: [''],
    interests: ['']
  }],
  exitDate: undefined,
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
  classes: [],
  isLoading: true,
  error: [],
  activeItem: 'Personal Info',
  errorMessage: '',
  edit: false,
  buttonContent: 'Toggle Edit Mode',
  deactivate: false
}

const inlineStyle = {
  modal: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

class VolunteerEdit extends Component {
  static propTypes = {
    match: object.isRequired,
    roles: array.isRequired
  }
  static contextTypes = {
    router: object.isRequired
  }
  state = {
    ...initialState
  }

  componentWillMount () {
    this.getProfile(this.props.match.params.userId)
  }

  getProfile = (userId) => {
    let { roles } = this.props
    axios.get(`/users/${userId}`)
      .then(response => {
        let userData = response.data.user
        console.log(userData)
        this.setState({
          name: userData.profile.name,
          address: userData.profile.address,
          handphone: userData.profile.handphone,
          dob: userData.profile.dob,
          gender: userData.profile.gender,
          nric: userData.profile.nric,
          nationality: userData.profile.nationality,
          postalCode: userData.profile.postalCode,
          homephone: userData.profile.homephone,
          fatherName: userData.father.name,
          fatherOccupation: userData.father.occupation,
          fatherEmail: userData.father.email,
          motherName: userData.mother.name,
          motherOccupation: userData.mother.occupation,
          motherEmail: userData.mother.email,
          hobbies: userData.misc.hobbies,
          careerGoal: userData.misc.careerGoal,
          schoolClass: userData.profile.schoolClass,
          schoolLevel: userData.profile.schoolLevel,

          /* Education / Training */
          formalEducation: userData.misc.formalEducation,
          coursesSeminar: userData.misc.coursesSeminar,
          achievements: userData.misc.achievements,
          cca: userData.misc.cca,
          cip: userData.misc.cip,
          workInternExp: userData.misc.workInternExp,
          competence: userData.misc.competence,
          commencementDate: moment(userData.commencementDate),
          exitDate: moment(userData.exitDate),
          preferredTimeSlot: {
            'Monday 7-9.30pm': userData.preferredTimeSlot.includes('Monday 7-9.30pm'),
            'Tuesday 7-9.30pm': userData.preferredTimeSlot.includes('Tuesday 7-9.30pm'),
            'Wednesday 7-9.30pm': userData.preferredTimeSlot.includes('Wednesday 7-9.30pm'),
            'Thursday 7-9.30pm': userData.preferredTimeSlot.includes('Thursday 7-9.30pm'),
            'Friday 7-9.30pm': userData.preferredTimeSlot.includes('Friday 7-9.30pm'),
            'Saturday 10-12.30pm': userData.preferredTimeSlot.includes('Saturday 10-12.30pm'),
            'Saturday 12.15-1.15pm': userData.preferredTimeSlot.includes('Saturday 10-12.30pm'),
            'Saturday 12.00-2.30pm': userData.preferredTimeSlot.includes('Saturday 12.00-2.30pm')
          },
          classes: userData.classes,
          isLoading: false
        })
        if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1) {
          this.setState({
            interviewDate: userData.admin.interviewDate,
            realCommencementDate: userData.admin.commencementDate,
            interviewNotes: userData.admin.interviewNotes,
            adminNotes: userData.admin.adminNotes
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  // Most of these edit functions are only allowed when edit mode to toggled to true.
  handleChange = (e, { name, value, checked }) => {
    if (this.state.edit === true) this.setState({ [name]: value || checked })
  }

  handleChangeCheckBox = (e, { name, checked }) => {
    if (this.state.edit === true) {
      this.setState({
        preferredTimeSlot: {
          ...this.state.preferredTimeSlot,
          [name]: checked
        }
      })
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({ isLoading: true, error: '', errorMessage: '' })
    if (this.state.edit === false) {
      this.setState({ edit: true, buttonContent: 'Submit and confirm edits', isLoading: false })
      return
    }
    // check required fields
    let error = this.checkRequired(['preferredTimeSlot', 'address', 'postalCode', 'handphone', 'homephone', 'schoolLevel', 'schoolClass', 'commencementDate', 'exitDate'])

    const { name, address, postalCode, handphone, homephone, dob, gender, nationality, nric, schoolLevel, schoolClass,
      fatherName, fatherOccupation, fatherEmail, motherName, motherOccupation, motherEmail, preferredTimeSlot,
      hobbies, careerGoal, formalEducation, coursesSeminar, achievements, cca, cip, workInternExp, competence,
      exitDate, interviewDate, interviewNotes, adminNotes, realCommencementDate } = this.state

    if (error.length === 0) {
      let volunteerData = {
        userId: this.props.match.params.userId,
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
        father: {
          name: fatherName,
          email: fatherEmail,
          occupation: fatherOccupation
        },
        mother: {
          name: motherName,
          occupation: motherOccupation,
          email: motherEmail
        },
        misc: {
          hobbies,
          careerGoal,
          formalEducation,
          coursesSeminar,
          achievements,
          cca,
          cip,
          workInternExp,
          competence
        },
        admin: {
          interviewDate,
          interviewNotes,
          adminNotes,
          commencementDate: realCommencementDate
        }
      }

      const timeSlot = Object.keys(preferredTimeSlot).reduce((last, curr) => (preferredTimeSlot[curr] ? last.concat(curr) : last), [])
      volunteerData.preferredTimeSlot = timeSlot

      axios.post('/users', volunteerData)
        .then(response => {
          this.getProfile(this.props.match.params.userId)
          this.setState({ isLoading: false, buttonContent: 'Toggle Edit Mode', edit: false })
        })
        .catch((err) => {
          console.log(err)
          this.setState({errorMessage: err.response.data.error, isLoading: false})
        })
    } else {
      console.log('error occured')
      error = error.join(', ')
      this.setState({error, isLoading: false})
    }
  }

  handleDateChange = (dateType) => (date) => {
    if (this.state.edit === true) this.setState({[dateType]: date})
  }

  handleRepeatable = (option, field) => (e) => {
    e.preventDefault()
    if (this.state.edit === true) {
      const updatingArray = this.state[field]
      if (option === 'inc') {
        if (field === 'formalEducation') {
          updatingArray.push({
            dateFrom: moment(),
            dateTo: moment(),
            school: '',
            highestLevel: ''
          })
        } else if (field === 'coursesSeminar') {
          updatingArray.push({
            year: '',
            courseAndObjective: ''
          })
        } else if (field === 'achievements') {
          updatingArray.push({
            dateFrom: moment(),
            dateTo: moment(),
            organisation: '',
            description: ''
          })
        } else if (field === 'cca' || field === 'cip' || field === 'workInternExp') {
          updatingArray.push({
            dateFrom: moment(),
            dateTo: moment(),
            organisation: '',
            rolePosition: ''
          })
        } else if (field === 'competence') {
          updatingArray.push({
            language: '',
            subjects: '',
            interests: ''
          })
        }
        this.setState({[field]: updatingArray})
      } else if (option === 'dec') { // remove last item
        this.setState({[field]: updatingArray.slice(0, updatingArray.length - 1)})
      }
    }
  }

  updateRepeatableChange = (index, field, property) => (e, {value}) => {
    if (this.state.edit === true) {
      const updatingArray = this.state[field]
      updatingArray[index][property] = value
      this.setState({[field]: updatingArray})
    }
  }

  updateRepeatableDateChange = (field, dateType, i) => (date) => {
    if (this.state.edit === true) {
      const updatingArray = this.state[field]
      updatingArray[i][dateType] = date
      this.setState({[field]: updatingArray})
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  deactivateAccount = (e) => {
    this.setState({ deactivate: true })
  }

  handleDeactivate = (e) => {
    let { userId } = this.props.match.params
    axios.delete('users', { data: {
      userId
    }
    })
      .then(response => {
        window.localStorage.removeItem('token')
        window.localStorage.removeItem('refreshToken')
        this.context.router.history.replace('/')
      })
      .catch(err => {
        console.log(err)
      })
  }

  handleClose = () => {
    this.setState({ deactivate: false })
  }

  render () {
    const { name, address, postalCode, handphone, homephone, schoolLevel, schoolClass, buttonContent, classes, realCommencementDate, interviewDate,
      fatherName, fatherOccupation, fatherEmail, motherName, motherOccupation, motherEmail, preferredTimeSlot, interviewNotes, adminNotes,
      hobbies, careerGoal, formalEducation, coursesSeminar, achievements, cca, cip, workInternExp, competence,
      commencementDate, exitDate, error, activeItem, errorMessage, isLoading, deactivate } = this.state // submitted version are used to display the info sent through POST (not necessary)

    const { roles } = this.props

    return (
      <Grid stackable stretched>
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
        <Grid.Row>
          <Grid.Column>
            <Menu attached='top' fluid pointing stackable>
              <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={this.handleItemClick} color={'red'}><Icon name='user' />Personal Info*</Menu.Item>
              <Menu.Item name='Family Details' active={activeItem === 'Family Details'} onClick={this.handleItemClick} color={'blue'}><Icon name='info circle' />Family Details</Menu.Item>
              <Menu.Item name='Personal Statement' active={activeItem === 'Personal Statement'} onClick={this.handleItemClick} color={'orange'}><Icon name='write' />Personal Statement</Menu.Item>
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <Menu.Item name='For office use' active={activeItem === 'For office use'} onClick={this.handleItemClick} color={'green'}><Icon name='dashboard' />For office use</Menu.Item>
              }
            </Menu>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>

            <Form onSubmit={this.handleSubmit}>
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
                  <Form.Input label='School level' placeholder='Sec 1 / JC 2' name='schoolLevel' value={schoolLevel} onChange={this.handleChange} required />
                  <Form.Input label='Class name' placeholder='class name' name='schoolClass' value={schoolClass} onChange={this.handleChange} required />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Input label='Mobile number' placeholder='Mobile number' name='handphone' value={handphone} onChange={this.handleChange} type='number' required />
                  <Form.Input label='Home tel' placeholder='Home tel' name='homephone' value={homephone} onChange={this.handleChange} required type='number' />
                </Form.Group>
              </Segment>
              }
              {activeItem === 'Family Details' &&
              <Segment attached='bottom'>
                <Form.Group widths='equal'>
                  <Form.Input label="Father's name" placeholder="Father's name" name='fatherName' value={fatherName} onChange={this.handleChange} />
                  <Form.Input label="Father's occupation" placeholder="Father's occupation" name='fatherOccupation' value={fatherOccupation} onChange={this.handleChange} />
                </Form.Group>
                <Form.Input label="Father's email" type='email' placeholder="Father's email" name='fatherEmail' value={fatherEmail} onChange={this.handleChange} />
                <Form.Group widths='equal'>
                  <Form.Input label="Mother's name" placeholder="Mother's name" name='motherName' value={motherName} onChange={this.handleChange} />
                  <Form.Input label="Mother's occupation" placeholder="Mother's occupation" name='motherOccupation' value={motherOccupation} onChange={this.handleChange} />
                </Form.Group>
                <Form.Input label="Mother's email" type='email' placeholder="Mother's email" name='motherEmail' value={motherEmail} onChange={this.handleChange} />
                <Form.Group widths='equal'>
                  <Form.Input label='Your Hobbies' placeholder='Your Hobbies' name='hobbies' value={hobbies} onChange={this.handleChange} />
                  <Form.Input label='Career Goal' name='careerGoal' value={careerGoal} onChange={this.handleChange} />
                </Form.Group>
              </Segment>
              }
              {activeItem === 'Personal Statement' &&
              <Segment attached='bottom'>
                <Header as='h3' dividing>Formal Education</Header>
                <Table celled striped columns={4} unstackable>
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
                              selected={formalEducation[i].dateFrom ? moment(formalEducation[i].dateFrom) : undefined}
                              selectsStart
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              maxDate={formalEducation[i].dateTo ? moment(formalEducation[i].dateTo) : undefined}
                              onChange={this.updateRepeatableDateChange('formalEducation', 'dateFrom', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={formalEducation[i].dateTo ? moment(formalEducation[i].dateTo) : undefined}
                              selectsEnd
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              minDate={formalEducation[i].dateFrom ? moment(formalEducation[i].dateFrom) : undefined}
                              onChange={this.updateRepeatableDateChange('formalEducation', 'dateTo', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`school-${i}`} name={`school-${i}`} value={formalEducation[i].school} placeholder='Name of Institution' onChange={this.updateRepeatableChange(i, 'formalEducation', 'school')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`highestLevel-${i}`} name={`highestLevel-${i}`} value={formalEducation[i].highestLevel} placeholder='Highest Level' onChange={this.updateRepeatableChange(i, 'formalEducation', 'highestLevel')} />
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
                <Table celled striped columns={2} unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={3}>Year</Table.HeaderCell>
                      <Table.HeaderCell width={7}>Course title and Learning Objectives</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {coursesSeminar.map((year, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>
                          <Form.Input transparent key={`year-${i}`} name={`year-${i}`} value={coursesSeminar[i].year ? moment(coursesSeminar[i].year).format('YYYY') : undefined} placeholder='Year' onChange={this.updateRepeatableChange(i, 'coursesSeminar', 'year')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`courseTitle-${i}`} name={`courseTitle-${i}`} value={coursesSeminar[i].courseAndObjective} placeholder='Name of Institution' onChange={this.updateRepeatableChange(i, 'coursesSeminar', 'courseAndObjective')} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan='2'>
                        <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'coursesSeminar')}>
                          <Icon name='plus' /> Add Year
                        </Button>
                        <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'coursesSeminar')}>
                          <Icon name='minus' /> Remove Year
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                </Table>

                <Header as='h3' dividing>Achievements</Header>
                <Table celled striped columns={4} unstackable>
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
                              selected={achievements[i].dateFrom ? moment(achievements[i].dateFrom) : undefined}
                              maxDate={achievements[i].dateTo ? moment(achievements[i].dateTo) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('achievements', 'dateFrom', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={achievements[i].dateTo ? moment(achievements[i].dateTo) : undefined}
                              minDate={achievements[i].dateFrom ? moment(achievements[i].dateFrom) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('achievements', 'dateTo', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={achievements[i].organisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange(i, 'achievements', 'organisation')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`description-${i}`} name={`description-${i}`} value={achievements[i].description} placeholder='Description of Award' onChange={this.updateRepeatableChange(i, 'achievements', 'description')} />
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
                <Table celled striped columns={4} unstackable>
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
                              selected={cca[i].dateFrom ? moment(cca[i].dateFrom) : undefined}
                              maxDate={cca[i].dateTo ? moment(cca[i].dateTo) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('cca', 'dateFrom', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={cca[i].dateTo ? moment(cca[i].dateTo) : undefined}
                              minDate={cca[i].dateFrom ? moment(cca[i].dateFrom) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('cca', 'dateTo', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={cca[i].organisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange(i, 'cca', 'organisation')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={cca[i].rolePosition} placeholder='rolePosition' onChange={this.updateRepeatableChange(i, 'cca', 'rolePosition')} />
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
                <Table celled striped columns={4} unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Starting Date</Table.HeaderCell>
                      <Table.HeaderCell>Ending Date</Table.HeaderCell>
                      <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                      <Table.HeaderCell>Position / Role</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {cip.map((year, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={cip[i].dateFrom ? moment(cip[i].dateFrom) : undefined}
                              maxDate={cip[i].dateTo ? moment(cip[i].dateTo) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('cip', 'dateFrom', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={cip[i].dateTo ? moment(cip[i].dateTo) : undefined}
                              minDate={cip[i].dateFrom ? moment(cip[i].dateFrom) : undefined}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              onChange={this.updateRepeatableDateChange('cip', 'dateTo', i)}
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={cip[i].organisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange(i, 'cip', 'organisation')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={cip[i].rolePosition} placeholder='rolePosition' onChange={this.updateRepeatableChange(i, 'cip', 'rolePosition')} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan='4'>
                        <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'cip')}>
                          <Icon name='plus' /> Add Year
                        </Button>
                        <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'cip')}>
                          <Icon name='minus' /> Remove Year
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                </Table>

                <Header as='h3' dividing>Name of Employer / Organisation</Header>
                <Table celled striped columns={4} unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Starting Date</Table.HeaderCell>
                      <Table.HeaderCell>Ending Date</Table.HeaderCell>
                      <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
                      <Table.HeaderCell>Position / Role</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {workInternExp.map((year, i) => (
                      <Table.Row key={i}>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={workInternExp[i].dateFrom ? moment(workInternExp[i].dateFrom) : undefined}
                              maxDate={workInternExp[i].dateTo ? moment(workInternExp[i].dateTo) : undefined}
                              onChange={this.updateRepeatableDateChange('workInternExp', 'dateFrom', i)}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <DatePicker
                              selected={workInternExp[i].dateTo ? moment(workInternExp[i].dateTo) : undefined}
                              minDate={workInternExp[i].dateFrom ? moment(workInternExp[i].dateFrom) : undefined}
                              onChange={this.updateRepeatableDateChange('workInternExp', 'dateTo', i)}
                              dateFormat='DD/MM/YYYY'
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode='select'
                              placeholderText='Click to select' />
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={workInternExp[i].organisation} placeholder='Name of Organisation' onChange={this.updateRepeatableChange(i, 'workInternExp', 'organisation')} />
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={workInternExp[i].rolePosition} placeholder='rolePosition' onChange={this.updateRepeatableChange(i, 'workInternExp', 'rolePosition')} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan='4'>
                        <Button floated='right' icon labelPosition='left' primary size='small' onClick={this.handleRepeatable('inc', 'workInternExp')}>
                          <Icon name='plus' /> Add Year
                        </Button>
                        <Button floated='right' icon labelPosition='left' negative size='small' onClick={this.handleRepeatable('dec', 'workInternExp')}>
                          <Icon name='minus' /> Remove Year
                        </Button>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                </Table>

                <Header as='h3' dividing>Competences Relevant For Teaching Children</Header>
                <Table celled striped columns={3} unstackable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={4}>Languages</Table.HeaderCell>
                      <Table.HeaderCell width={4}>Subjects</Table.HeaderCell>
                      <Table.HeaderCell width={4}>Interests</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell style={{ overflow: 'visible' }}>
                        <Form.Input transparent key={`languages`} placeholder='Specific language' name={`languages`} value={competence[0].languages} onChange={this.updateRepeatableChange(0, 'competence', 'languages')} />
                      </Table.Cell>
                      <Table.Cell>
                        <Form.Input transparent key={`subjects`} name={`subjects`} value={competence[0].subjects} placeholder='Specific subjects' onChange={this.updateRepeatableChange(0, 'competence', 'subjects')} />
                      </Table.Cell>
                      <Table.Cell>
                        <Form.Input transparent key={`interests`} name={`interests`} value={competence[0].interests} placeholder='Specific interests' onChange={this.updateRepeatableChange(0, 'competence', 'interests')} />
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Segment>
              }
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) && activeItem === 'For office use' &&
              <Segment attached='bottom'>
                <Form.Field>
                  <label>Interview date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    selected={interviewDate ? moment(interviewDate) : undefined}
                    onChange={this.handleDateChange('interviewDate')}
                  />
                </Form.Field>
                <Form.Input label='Interview notes' placeholder='reason for acceptance' name='interviewNotes' value={interviewNotes} onChange={this.handleChange} />
                <Form.Field>
                  <label>Commencement date</label>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    dropdownMode='select'
                    minDate={interviewDate ? moment(interviewDate) : undefined}
                    selected={realCommencementDate ? moment(realCommencementDate) : undefined}
                    onChange={this.handleDateChange('realCommencementDate')}
                  />
                </Form.Field>
                <Form.Input label='Admin notes' placeholder='up to 1000 words' name='adminNotes' value={adminNotes} onChange={this.handleChange} />
              </Segment>
              }
              <Form.Field>
                <label>Intended Date of Exit</label>
                <DatePicker
                  placeholderText='Click to select a date'
                  dateFormat='DD/MM/YYYY'
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode='select'
                  selected={exitDate ? moment(exitDate) : undefined}
                  onChange={this.handleDateChange('exitDate')}
                  minDate={commencementDate ? moment(commencementDate) : undefined}
                  required />
              </Form.Field>

              <Form.Group inline>
                <label>Date of Preferred Time Slot *</label>
                {timeSlotOptions.map((option, i) => {
                  return (
                    <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={this.handleChangeCheckBox} checked={preferredTimeSlot[option.value]} />
                  )
                })}
              </Form.Group>
              <Message
                hidden={error.length === 0}
                negative
                content={`Please Check Required Fields - ${error}`}
              />
              <Message
                hidden={errorMessage.length === 0}
                color='orange'
                content={errorMessage}
              />
              <Form.Button type='sumbit'>{buttonContent}</Form.Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3' dividing>Classes</Header>
            <Table compact celled unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width='1'>S/N</Table.HeaderCell>
                  <Table.HeaderCell width='6'>Name</Table.HeaderCell>
                  <Table.HeaderCell width='5'>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              {classes.length !== 0 &&
              <Table.Body>
                {classes.map((Class, i) => (
                  <Table.Row key={Class._id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell><Link to={`/dashboard/classes/id/${Class._id}`}>{Class.className}</Link></Table.Cell>
                    <Table.Cell>{Class.status}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
              }
              {classes.length === 0 &&
              <Table.Body>
                <Table.Row key={'empty-class'}>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>Oops! No classes found!</Table.Cell>
                  <Table.Cell>nil</Table.Cell>
                </Table.Row>
              </Table.Body>
              }
            </Table>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Header as='h3' dividing>Personal Settings</Header>
            <Button negative animated='vertical' onClick={this.deactivateAccount}>
              <Button.Content visible>Deactivate your account</Button.Content>
              <Button.Content hidden>
                <Icon name='trash' />
              </Button.Content>
            </Button>
            <Modal open={deactivate} onClose={this.close} dimmer='blurring' size='fullscreen' style={inlineStyle.modal}>
              <Modal.Header>Is this goodbye? =(</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <Header>Before you go...</Header>
                  <p>Note that the account deactivation is highly irreverisble</p>
                  <p>UPStars thank you for being with us. We hope to have you onboard again!</p>
                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button negative icon='close' labelPosition='right' content='Never mind, keep my account' onClick={this.handleClose} />
                <Button positive icon='checkmark' labelPosition='right' content='Deactivate' onClick={this.handleDeactivate} />
              </Modal.Actions>
            </Modal>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
export default VolunteerEdit
