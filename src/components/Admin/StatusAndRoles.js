import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Table, Dropdown, Header, Grid } from 'semantic-ui-react'
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
  { key: 'Mentor', text: 'Mentor', value: 'Mentor' },
  { key: 'Adhoc', text: 'Adhoc', value: 'Adhoc' }
]

const StatusAndRoles = ({userData, dispatch, userType}) => {
  /*
  ===========
  FUNCTIONS
  ===========
  */
  // userType is always the status of user with the first character in UpperCase such as Pending (and) Active
  const stateUserName = userType.toLowerCase() + 'Users'
  const handleStatus = (userId, index) => async (e, {value}) => {
    e.preventDefault()
    dispatch({type: 'updateField', name: 'isLoading', value: true})
    try {
      await axios.post('admin/userStatusPermissions', { userId, newStatus: value })
      let newUserArray = [...userData]
      newUserArray[index].status = value
      dispatch({type: 'updateField', name: stateUserName, value: newUserArray})
    } catch (err) {
      dispatch({type: 'updateField', name: 'error', value: err.response.data.error})
    } finally {
      dispatch({type: 'updateField', name: 'isLoading', value: false})
    }
  }

  const handleRole = (userId, index) => async (e, {value}) => {
    e.preventDefault()
    if (value.length === 0) {
      return
    }
    dispatch({type: 'updateField', name: 'isLoading', value: true})
    try {
      await axios.post('admin/userStatusPermissions', { userId, newRoles: value })
      let newUserArray = [...userData]
      newUserArray[index].roles = value
      dispatch({type: 'updateField', name: stateUserName, value: newUserArray})
    } catch (err) {
      dispatch({type: 'updateField', name: 'error', value: err.response.data.error})
    } finally {
      dispatch({type: 'updateField', name: 'isLoading', value: false})
    }
  }
  /*
  ============
  RENDER
  ============
  */

  return (
    <Grid.Row>
      <Grid.Column>
        <Header as='h3' dividing>{userType} Users</Header>
        <Table celled columns={3} unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Roles</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          {userData.length !== 0 &&
          <Table.Body>
            {userData.map((user, i) => (
              <Table.Row key={`user-${user._id}`}>
                <Table.Cell><Link to={`/dashboard/volunteer/profile/${user._id}`}>{user.name}</Link></Table.Cell>
                <Table.Cell><Dropdown placeholder='Select Status' fluid selection options={statusOptions} value={user.status} onChange={handleStatus(user._id, i)} /></Table.Cell>
                <Table.Cell><Dropdown placeholder='Roles' fluid multiple selection options={roleOptions} value={user.roles} onChange={handleRole(user._id, i)} /></Table.Cell>
              </Table.Row>))}
          </Table.Body>
          }
          {userData.length === 0 &&
          <Table.Body>
            <Table.Row key={`empty-${userType}-user`}>
              <Table.Cell>Oops! No {userType} Users Found!</Table.Cell>
              <Table.Cell>nil</Table.Cell>
              <Table.Cell>nil</Table.Cell>
            </Table.Row>
          </Table.Body>
          }
        </Table>
      </Grid.Column>
    </Grid.Row>
  )
}

StatusAndRoles.propTypes = {
  userData: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  userType: PropTypes.string.isRequired
}

export default React.memo(StatusAndRoles)
