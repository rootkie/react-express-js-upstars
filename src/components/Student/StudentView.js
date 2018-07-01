import React, { Component } from 'react'
import { array, func, bool } from 'prop-types'
import { Link } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm, Dimmer, Loader } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

// From primary 1 to secondary 4
const ageOptions = [
  { key: '7', text: '7', value: '7' },
  { key: '8', text: '8', value: '8' },
  { key: '9', text: '9', value: '9' },
  { key: '10', text: '10', value: '10' },
  { key: '11', text: '11', value: '11' },
  { key: '12', text: '12', value: '12' },
  { key: '13', text: '13', value: '13' },
  { key: '14', text: '14', value: '14' }
]

class StudentView extends Component {
  static propTypes = {
    studentData: array.isRequired,
    deleteStudent: func.isRequired,
    searchFilter: func.isRequired,
    isLoading: bool,
    roles: array.isRequired
  }

  state = {
    selected: [],
    deleteConfirmationVisibility: false,
    searchName: '',
    moreOptions: false,
    genderSelector: [],
    ageSelector: []
  }

  handleCheckboxChange = (e, { name: _id, checked }) => { // name here is actually the ID of the student
    let { selected } = this.state
    if (checked) {
      selected.push(_id)
    } else {
      selected = selected.filter((element) => element !== _id)
    }
    this.setState({selected})
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  handleDelete = () => {
    const { selected } = this.state
    const { deleteStudent } = this.props
    selected.length > 0 && deleteStudent(selected)
    this.setState({selected: []})
  }

  handleDeleteConfirmation = (option) => () => {
    switch (option) {
      case 'show':
        this.setState({deleteConfirmationVisibility: true})
        break
      case 'confirm':
        this.handleDelete()
        // break omitted
      case 'cancel': // eslint-disable-line
        this.setState({deleteConfirmationVisibility: false})
        break
      default:
    }
  }

  handleFilter = (e) => {
    e.preventDefault()
    const { searchFilter } = this.props
    const { searchName, ageSelector, genderSelector } = this.state
    const options = []
    searchName.length > 0 && options.push({field: 'profile-name', value: searchName})
    ageSelector.length > 0 && options.push({field: 'profile-age', value: ageSelector})
    genderSelector.length > 0 && options.push({field: 'profile-gender', value: genderSelector})
    searchFilter(options)
  }

  clearAll = e => {
    e.preventDefault()
    this.setState({ genderSelector: [], ageSelector: [], searchName: '' })
  }

  render () {
    const { selected, searchName, deleteConfirmationVisibility, moreOptions, genderSelector, ageSelector } = this.state
    const { studentData, isLoading, roles } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
      return (
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='5'>
                <Form>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Group inline style={{marginBottom: 0}}>
                      <Form.Input label='Search by name' placeholder='Leave it empty to view all' name='searchName' value={searchName} onChange={this.handleChange} />
                      <Form.Button onClick={this.handleFilter}>Filter results</Form.Button>
                      <Form.Button color='red' onClick={this.clearAll}>Clear all</Form.Button>
                    </Form.Group>
                    <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                  </div>
                  {moreOptions && <div>
                    <Form.Field style={{paddingTop: '10px'}}>
                      <label>Filter by Gender</label>
                      <Dropdown name='genderSelector' value={genderSelector} placeholder='Male or Female' multiple selection options={genderOptions} onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field>
                      <label>Filter by Age</label>
                      <Dropdown name='ageSelector' value={ageSelector} placeholder='Select age range' search multiple selection options={ageOptions} onChange={this.handleChange} />
                    </Form.Field>
                  </div>}

                </Form>
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              {roles.indexOf('SuperAdmin') !== -1 &&
              <Table.HeaderCell />
              }
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Age</Table.HeaderCell>
              <Table.HeaderCell>IC Number</Table.HeaderCell>
              <Table.HeaderCell>Gender</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {studentData.map((student, i) => (
              <Table.Row key={`student-${i}`}>
                {roles.indexOf('SuperAdmin') !== -1 &&
                <Table.Cell collapsing>
                  <Checkbox name={student._id} onChange={this.handleCheckboxChange} checked={selected.includes(student._id)} />
                </Table.Cell>
                }
                <Table.Cell><Link to={`/dashboard/students/edit/${student._id}`}>{student.profile.name}</Link></Table.Cell>
                <Table.Cell>{moment().diff(student.profile.dob, 'years')}</Table.Cell>
                <Table.Cell>{student.profile.icNumber}</Table.Cell>
                <Table.Cell>{student.profile.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
              </Table.Row>))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell colSpan='4'>
                {roles.indexOf('SuperAdmin') !== -1 &&
                <div>
                  <Link to='/dashboard/students/add'>
                    <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                      <Icon name='user' />New Student
                    </Button>
                  </Link>
                  <Button size='small' disabled={selected.length === 0} negative onClick={this.handleDeleteConfirmation('show')}>Delete</Button>
                  <Confirm
                    open={deleteConfirmationVisibility}
                    header='Deleting the following students:'
                    content={selected.map((id) => (
                      studentData.filter((student) => (student._id === id))[0].profile.name
                    )).join(', ')}
                    onCancel={this.handleDeleteConfirmation('cancel')}
                    onConfirm={this.handleDeleteConfirmation('confirm')}
                  />
                </div>
                }
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      )
    }
  }
}

export default StudentView
