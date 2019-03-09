import React, { Component } from 'react'
import { func, array } from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm, Dimmer, Loader, Grid, Search } from 'semantic-ui-react'
import moment from 'moment'
import axios from 'axios'
import { filterData } from '../../utils'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

const inlineStyle = {
  confirm: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

class VolunteerView extends Component {
  static propTypes = {
    deleteUser: func.isRequired,
    roles: array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      selected: [],
      deleteConfirmationVisibility: false,
      isLoadingSearch: false,
      results: [],
      id: '',
      value: '',
      redirect: false,
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
        let editedData = [...response.data.users]
        this.setState({ isLoading: false, volunteerData, editedData })
      })
      .catch(err => {
        console.log(err)
        this.setState({isLoading: false})
      })
  }

  resetComponent = () => this.setState({ isLoadingSearch: false, results: [] })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoadingSearch: true, value })
    if (value.length < 1) return this.resetComponent()
    axios.get(`usersResponsive/${value}`)
      .then(response => {
        let volunteerList = response.data.users.map(user => {
          return {
            title: user.name,
            id: user._id,
            key: user._id
          }
        })
        this.setState({ isLoadingSearch: false, results: volunteerList })
      })
  }

  handleResultSelect = (e, { result }) => {
    this.setState({redirect: true, id: result.id})
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

  handleDelete = async () => {
    const { selected } = this.state
    const { deleteUser } = this.props
    this.setState({ isLoading: true })
    selected.length > 0 && await deleteUser(selected)
    this.getVolunteers()
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
    const { genderSelector, volunteerData } = this.state
    const options = []
    genderSelector.length > 0 && options.push({field: 'gender', value: genderSelector})
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
    const { selected, isLoadingSearch, deleteConfirmationVisibility, moreOptions, genderSelector, isLoading, editedData, redirect, id, results, value } = this.state
    const { roles } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else if (redirect && id.length !== 0) {
      return <Redirect push to={`/dashboard/volunteer/profile/${id}`} />
    } else {
      return (
        <Grid stackable stretched>
          <Grid.Row>
            <Grid.Column>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan='5'>
                      <Form>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Form.Group inline style={{marginBottom: 0}}>
                            <Search
                              loading={isLoadingSearch}
                              onResultSelect={this.handleResultSelect}
                              onSearchChange={this.handleSearchChange}
                              results={results}
                              value={value}
                            />
                          </Form.Group>
                          <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                        </div>
                        {moreOptions && <div>
                          <Form.Field style={{paddingTop: '10px'}}>
                            <label>Filter by Gender</label>
                            <Dropdown name='genderSelector' value={genderSelector} placeholder='Male or Female' multiple selection options={genderOptions} onChange={this.handleChange} />
                          </Form.Field>
                          <Form.Group>
                            <Form.Button onClick={this.handleFilter}>Filter results</Form.Button>
                            <Form.Button color='red' onClick={this.clearAll}>Clear all</Form.Button>
                          </Form.Group>
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
                {editedData.length !== 0 &&
                <Table.Body>
                  {editedData.map((user, i) => (
                    <Table.Row key={`user-${i}`}>
                      {roles.indexOf('SuperAdmin') !== -1 &&
                      <Table.Cell collapsing>
                        <Checkbox name={user._id} onChange={this.handleCheckboxChange} checked={selected.includes(user._id)} />
                      </Table.Cell>
                      }
                      <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.name}</Link></Table.Cell>
                      <Table.Cell>{moment().diff(user.dob, 'years')}</Table.Cell>
                      <Table.Cell>{user.nric}</Table.Cell>
                      <Table.Cell>{user.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
                }
                {editedData.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-user`}>
                    {roles.indexOf('SuperAdmin') !== -1 &&
                      <Table.Cell collapsing />
                    }
                    <Table.Cell>Oops! No Volunteers Found!</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                  </Table.Row>
                </Table.Body>
                }
                <Table.Footer fullWidth>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='4'>
                      {roles.indexOf('SuperAdmin') !== -1 &&
                      <div>
                        <Button size='small' disabled={selected.length === 0} negative onClick={this.handleDeleteConfirmation('show')}>Delete</Button>
                        <Confirm
                          open={deleteConfirmationVisibility}
                          header='Deleting the following students:'
                          content={selected.map((id) => (
                            editedData.filter((user) => (user._id === id))[0].name
                          )).join(', ')}
                          onCancel={this.handleDeleteConfirmation('cancel')}
                          onConfirm={this.handleDeleteConfirmation('confirm')}
                          style={inlineStyle.confirm}
                        />
                      </div>
                      }
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
  }
}

export default VolunteerView
