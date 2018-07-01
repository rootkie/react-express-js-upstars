import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table, Form, Dropdown, Dimmer, Loader, Header, Message } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'

const statusOptions = [
  { key: 'Deleted', text: 'Deleted', value: 'Deleted' },
  { key: 'Suspended', text: 'Suspended', value: 'Suspended' },
  { key: 'Active', text: 'Active', value: 'Active' },
  { key: 'Pending', text: 'Pending', value: 'Pending' }
]

const roleOptions = [
  { key: 'SuperAdmin', text: 'SuperAdmin', value: 'SuperAdmin' },
  { key: 'Admin', text: 'Admin', value: 'Admin' },
  { key: 'Tutor', text: 'Tutor', value: 'Tutor' },
  { key: 'SuperVisor', text: 'SuperVisor', value: 'SuperVisor' },
  { key: 'Temporary', text: 'Temporary', value: 'Temporary' },
  { key: 'Helper', text: 'Helper', value: 'Helper' },
  { key: 'Mentor', text: 'Mentor', value: 'Mentor' },
  { key: 'Adhoc', text: 'Adhoc', value: 'Adhoc' }
]

class ChangeStatus extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchName: '',
      pendingUsers: [],
      activeUsers: [],
      suspendedUsers: [],
      deletedUsers: [],
      error: '',
      isLoading: true
    }
    this.getData()
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  getData = () => {
    axios.all(
      [
        axios.get('admin/pendingUsers'),
        axios.get('users'),
        axios.get('admin/suspended'),
        axios.get('admin/deleted')
      ])
      .then(axios.spread((pending, active, suspended, deleted) => {
        let pendingUsers = pending.data.users
        let activeUsers = active.data.users
        let suspendedUsers = suspended.data.users
        let deletedUsers = deleted.data.users
        this.setState({ pendingUsers, activeUsers, suspendedUsers, deletedUsers, isLoading: false })
      }))
  }

  handleStatus = (type, index) => (e, {value}) => {
    let { pendingUsers, activeUsers, suspendedUsers, deletedUsers } = this.state
    this.setState({ isLoading: true })
    e.preventDefault()
    switch (type) {
      case 'pendingUsers':
        if (pendingUsers[index].status === value) {
          this.setState({ isLoading: false })
          break
        }
        pendingUsers[index].status = value
        axios.post('admin/userStatusPermissions', { userId: pendingUsers[index]._id, newStatus: value })
          .then(response => {
            this.setState({ pendingUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'activeUsers':
        if (activeUsers[index].status === value) {
          this.setState({ isLoading: false })
          break
        }
        activeUsers[index].status = value
        axios.post('admin/userStatusPermissions', { userId: activeUsers[index]._id, newStatus: value })
          .then(response => {
            this.setState({ pendingUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'suspendedUsers':
        if (suspendedUsers[index].status === value) {
          this.setState({ isLoading: false })
          break
        }
        suspendedUsers[index].status = value
        axios.post('admin/userStatusPermissions', { userId: suspendedUsers[index]._id, newStatus: value })
          .then(response => {
            this.setState({ pendingUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'deletedUsers':
        if (deletedUsers[index].status === value) {
          this.setState({ isLoading: false })
          break
        }
        deletedUsers[index].status = value
        axios.post('admin/userStatusPermissions', { userId: deletedUsers[index]._id, newStatus: value })
          .then(response => {
            this.setState({ pendingUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      default:
    }
  }

  handleRole = (type, index) => (e, {value}) => {
    let { pendingUsers, activeUsers, suspendedUsers, deletedUsers } = this.state
    e.preventDefault()
    if (value.length === 0) {
      return
    }
    this.setState({ isLoading: true })
    switch (type) {
      case 'pendingUsers':
        if (pendingUsers[index].roles === value) {
          this.setState({ isLoading: false })
          break
        }
        pendingUsers[index].roles = value
        axios.post('admin/userStatusPermissions', { userId: pendingUsers[index]._id, newRoles: value })
          .then(response => {
            this.setState({ pendingUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'activeUsers':
        if (activeUsers[index].roles === value) {
          this.setState({ isLoading: false })
          break
        }
        activeUsers[index].roles = value
        axios.post('admin/userStatusPermissions', { userId: activeUsers[index]._id, newRoles: value })
          .then(response => {
            this.setState({ activeUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'suspendedUsers':
        if (suspendedUsers[index].roles === value) {
          this.setState({ isLoading: false })
          break
        }
        suspendedUsers[index].roles = value
        axios.post('admin/userStatusPermissions', { userId: suspendedUsers[index]._id, newRoles: value })
          .then(response => {
            this.setState({ suspendedUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      case 'deletedUsers':
        if (deletedUsers[index].roles === value) {
          this.setState({ isLoading: false })
          break
        }
        deletedUsers[index].roles = value
        axios.post('admin/userStatusPermissions', { userId: deletedUsers[index]._id, newRoles: value })
          .then(response => {
            this.setState({ deletedUsers, isLoading: false })
          })
          .catch(err => {
            console.log(err)
            this.setState({ error: err.response.data.error, isLoading: false })
          })
        break
      default:
    }
  }

  refresh = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.getData()
  }

  render () {
    const { searchName, isLoading, activeUsers, pendingUsers, suspendedUsers, deletedUsers, error } = this.state
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
        <div>
          <Table compact celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='5'>
                  <Form>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Form.Group inline style={{marginBottom: 0}}>
                        <Form.Input label='Search by name' placeholder='Leave it empty to view all' name='searchName' value={searchName} onChange={this.handleChange} />
                        <Form.Button onClick={this.handleFilter}>Filter results</Form.Button>
                        <Form.Button positive onClick={this.refresh}>Refresh Data</Form.Button>
                      </Form.Group>
                    </div>
                  </Form>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
          <Message
            hidden={error === ''}
            negative
            content={error}
          />
          <Header as='h3' dividing>Pending Users</Header>
          <Table celled columns={3}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Roles</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {pendingUsers.map((user, i) => (
                <Table.Row key={`user-${i}`}>
                  <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.profile.name}</Link></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Select Status' fluid selection options={statusOptions} value={user.status} onChange={this.handleStatus('pendingUsers', i)} /></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Roles' fluid multiple selection options={roleOptions} value={user.roles} onChange={this.handleRole('pendingUsers', i)} /></Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table>
          <Header as='h3' dividing>Active Users</Header>
          <Table celled columns={3}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Roles</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {activeUsers.map((user, i) => (
                <Table.Row key={`user-${i}`}>
                  <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.profile.name}</Link></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Select Status' fluid selection options={statusOptions} value={user.status} onChange={this.handleStatus('activeUsers', i)} /></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Roles' fluid multiple selection options={roleOptions} value={user.roles} onChange={this.handleRole('activeUsers', i)} /></Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table>
          <Header as='h3' dividing>Suspended Users</Header>
          <Table celled columns={3}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Roles</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {suspendedUsers.map((user, i) => (
                <Table.Row key={`user-${i}`}>
                  <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.profile.name}</Link></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Select Status' fluid selection options={statusOptions} value={user.status} onChange={this.handleStatus('suspendedUsers', i)} /></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Roles' fluid multiple selection options={roleOptions} value={user.roles} onChange={this.handleRole('suspendedUsers', i)} /></Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table>
          <Header as='h3' dividing>Deleted Users</Header>
          <Table celled columns={3}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Roles</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {deletedUsers.map((user, i) => (
                <Table.Row key={`user-${i}`}>
                  <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.profile.name}</Link></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Select Status' fluid selection options={statusOptions} value={user.status} onChange={this.handleStatus('deletedUsers', i)} /></Table.Cell>
                  <Table.Cell><Dropdown placeholder='Roles' fluid multiple selection options={roleOptions} value={user.roles} onChange={this.handleRole('deletedUsers', i)} /></Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table>
        </div>
      )
    }
  }
}

export default ChangeStatus
