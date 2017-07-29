import React, { Component } from 'react'
import { array, func, object } from 'prop-types'
import { Link } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

const ageOptions = [
  { key: '10', text: '10', value: '10' },
  { key: '11', text: '11', value: '11' },
  { key: '12', text: '12', value: '12' }
]

class StudentView extends Component {
  static propTypes = {
    studentData: array.isRequired,
    deleteStudent: func.isRequired,
    searchFilter: func.isRequired
  }

  static contextTypes = {
    router: object
  }

  state = {
    selected: [],
    deleteConfirmationVisibility: false,

    searchName: '',
    moreOptions: false,
    genderSelector: [],
    ageSelector: []
  }

  handleCheckboxChange = (e, { name, checked }) => {
    let { selected } = this.state
    if (checked) {
      selected.push(name) // name here is actually IC number, for uniqueness
    } else {
      selected = selected.filter((element) => element !== name)
    }
    this.setState({selected})
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  handleDelete = () => {
    const { selected } = this.state
    const { deleteStudent, studentData } = this.props
    const toDeleteArray = studentData.filter((student) => selected.includes(student.profile.icNumber)).map(student => student._id)
    deleteStudent(toDeleteArray)
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

  handleEditStudent = () => {
    const { selected } = this.state
    const { studentData } = this.props
    const toEditId = studentData.filter((student) => selected.includes(student.profile.icNumber)).map(student => student._id)
    this.context.router.history.push(`/students/edit/${toEditId}`)
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

  render () {
    const { selected, searchName, deleteConfirmationVisibility, moreOptions, genderSelector, ageSelector } = this.state
    const { studentData } = this.props
    return (
      <Table compact celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>
              <Form onSubmit={this.handleFilter}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Form.Group inline style={{marginBottom: 0}}>
                    <Form.Input label='Search by name' placeholder='Student Name' name='searchName' value={searchName} onChange={this.handleChange} />
                    <Form.Button>Go</Form.Button>
                  </Form.Group>
                  <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                </div>
                {moreOptions && <div>
                  <Form.Field style={{paddingTop: '10px'}}>
                    <label>Filter by Gender</label>
                    <Dropdown name='genderSelector' value={genderSelector} placeholder='Pick Classes' search multiple selection options={genderOptions} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>Filter by Age</label>
                    <Dropdown name='ageSelector' value={ageSelector} placeholder='Pick Volunteers' search multiple selection options={ageOptions} onChange={this.handleChange} />
                  </Form.Field>
                </div>}

              </Form>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Age</Table.HeaderCell>
            <Table.HeaderCell>IC Number</Table.HeaderCell>
            <Table.HeaderCell>Gender</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {studentData.map(({profile}, i) => (
            <Table.Row key={`student-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={profile.icNumber} onChange={this.handleCheckboxChange} checked={selected.includes(profile.icNumber)} />
              </Table.Cell>
              <Table.Cell>{profile.name}</Table.Cell>
              <Table.Cell>{moment().diff(profile.dob, 'years')}</Table.Cell>
              <Table.Cell>{profile.icNumber}</Table.Cell>
              <Table.Cell>{profile.gender === 'F' ? 'female' : 'male'}</Table.Cell>
            </Table.Row>))}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell colSpan='4'>
              <Link to='/students/add'>
                <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                  <Icon name='user' />New Student
              </Button>
              </Link>
              <Button size='small' disabled={selected.length === 0} negative onClick={this.handleDeleteConfirmation('show')}>Delete</Button>
              <Button size='small' disabled={selected.length !== 1} onClick={this.handleEditStudent}>Edit</Button>
              <Confirm
                open={deleteConfirmationVisibility}
                header='Deleting the following students:'
                content={selected.join(', ')}
                onCancel={this.handleDeleteConfirmation('cancel')}
                onConfirm={this.handleDeleteConfirmation('confirm')}
        />

            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    )
  }
}

export default StudentView
