import React, { Component } from 'react'
import { func } from 'prop-types'
import { Link } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm, Dimmer, Loader } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'
import axios from 'axios'
import { filterData } from '../../utils'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

class VolunteerView extends Component {
  static propTypes = {
    deleteUser: func.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      selected: [],
      deleteConfirmationVisibility: false,
      searchName: '',
      moreOptions: false,
      genderSelector: [],
      isLoading: true,
      volunteerData: [],
      editedData: []
    }
    this.getVolunteers()
  }

  getVolunteers = () => {
    axios.get('/users')
      .then(response => {
        let volunteerData = response.data.users
        let editedData = response.data.users
        console.log(volunteerData)
        this.setState({ isLoading: false, volunteerData, editedData })
      })
      .catch(err => {
        console.log(err)
        this.setState({isLoading: false})
      })
  }

  handleCheckboxChange = (e, { name: _id, checked }) => { // name here is actually the ID of the user
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
    const { deleteUser } = this.props
    this.setState({ isLoading: true })
    selected.length > 0 && deleteUser(selected)
    setTimeout(this.getVolunteers(), 1500)
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
    const { searchName, genderSelector, volunteerData } = this.state
    const options = []
    searchName.length > 0 && options.push({field: 'profile-name', value: searchName})
    genderSelector.length > 0 && options.push({field: 'profile-gender', value: genderSelector})
    if (options.length === 0) {
      this.setState({ editedData: volunteerData })
    } else {
      this.searchFilter(options, volunteerData)
    }
  }

  searchFilter = (criteria, userData) => {
    this.setState({ editedData: filterData(userData, criteria) })
  }

  clearAll = e => {
    e.preventDefault()
    this.setState({ genderSelector: [], searchName: '' })
  }

  render () {
    const { selected, searchName, deleteConfirmationVisibility, moreOptions, genderSelector, isLoading, editedData } = this.state
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
            {editedData.map((user, i) => (
              <Table.Row key={`user-${i}`}>
                <Table.Cell collapsing>
                  <Checkbox name={user._id} onChange={this.handleCheckboxChange} checked={selected.includes(user._id)} />
                </Table.Cell>
                <Table.Cell><Link to={`/volunteer/profile/${user._id}`}>{user.profile.name}</Link></Table.Cell>
                <Table.Cell>{moment().diff(user.profile.dob, 'years')}</Table.Cell>
                <Table.Cell>{user.profile.nric}</Table.Cell>
                <Table.Cell>{user.profile.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
              </Table.Row>))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell colSpan='4'>
                <Button size='small' disabled={selected.length === 0} negative onClick={this.handleDeleteConfirmation('show')}>Delete</Button>
                <Confirm
                  open={deleteConfirmationVisibility}
                  header='Deleting the following students:'
                  content={selected.map((id) => (
                    editedData.filter((user) => (user._id === id))[0].profile.name
                  )).join(', ')}
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
}

export default VolunteerView
