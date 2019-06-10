import React from 'react'
import { Header, Table, Checkbox, Button, Icon, Search, Divider } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import axios from 'axios'

const UserList = ({ state, roles, dispatch, id, getClass }) => {
  /*
  =============
  FUNCTIONS
  =============
  */
  const handleCheckBoxForUser = (e, { name: _id, checked }) => {
    const { userSelected } = state
    const newSelection = checked ? [...userSelected, _id] : userSelected.filter(element => element !== _id)
    dispatch({ type: 'handleChange', name: 'userSelected', value: newSelection })
  }

  const deleteUnsaved = (_id) => e => {
    e.preventDefault()
    const { userList } = state
    const newList = userList.filter(el => el._id !== _id)
    dispatch({ type: 'handleChange', name: 'userList', value: newList })
  }

  const addUser = async e => {
    e.preventDefault()
    const { userList } = state
    const idList = userList.map(info => info._id)
    axios.post('users/class', {
      classId: id,
      userIds: idList
    })
      .then(response => {
        getClass(id)
        dispatch({ type: 'addUserSuccess' })
        setTimeout(() => { dispatch({ type: 'closeMessage' }) }, 5000)
      })
      .catch(err => {
        dispatch({ type: 'showError', error: err.response.data.error })
      })
  }

  const deleteUser = async e => {
    e.preventDefault()
    axios.delete('users/class', {
      data: {
        classId: id,
        userIds: state.userSelected
      }
    })
      .then(response => {
        getClass(id)
        dispatch({ type: 'deleteUserSuccess' })
        setTimeout(() => { dispatch({ type: 'closeMessage' }) }, 5000)
      })
      .catch(err => {
        dispatch({ type: 'showError', error: err.response.data.error })
      })
  }

  const handleResultsSelect = (e, { result }) => {
    const { userList, overallClassData } = state
    const exist = overallClassData.users.findIndex(user => user._id === result._id)
    const duplicate = userList.findIndex(user => user._id === result._id)
    if (exist !== -1 || duplicate !== -1) {
      return dispatch({ type: 'handleChange', name: 'valueUser', value: '' })
    }
    const newList = [
      ...userList,
      {
        _id: result._id,
        name: result.title
      }
    ]
    dispatch({ type: 'handleChange', name: 'userList', value: newList })
    dispatch({ type: 'handleChange', name: 'valueUser', value: '' })
  }

  const handleSearchChange = (e, { value }) => {
    if (value.length < 1) return dispatch({ type: 'resetSearch' })
    dispatch({ type: 'searchChangeUser', value })
    axios.get(`usersResponsive/${value}`)
      .then(response => {
        const userOptions = response.data.users.map(user => {
          return {
            title: user.name,
            _id: user._id,
            key: user._id
          }
        })
        dispatch({ type: 'setUserOption', userOptions })
      })
  }

  const { overallClassData, userList, userSelected, edit, userOptions, isLoadingUser, valueUser } = state
  return (
    <React.Fragment>
      <Header as='h3' dividing>Users</Header>
      {(roles.indexOf('SuperAdmin') !== -1 && edit) &&
        <React.Fragment>
          <Table compact celled unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width='1'>Action</Table.HeaderCell>
                <Table.HeaderCell width='12'>Name</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {overallClassData.users.map((User, i) => (
                <Table.Row key={`user-${i}`}>
                  <Table.Cell collapsing>
                    <Checkbox name={User._id} onChange={handleCheckBoxForUser} checked={userSelected.includes(User._id)} />
                  </Table.Cell>
                  <Table.Cell>{User.name}</Table.Cell>
                </Table.Row>))}
              {/* The table below joins but is coloured red so that the user knows they are unsaved changes */}
              {userList.map((unsavedUser, i) => (
                <Table.Row key={`unsavedStudent-${i}`} negative>
                  <Table.Cell collapsing>
                    <Button onClick={deleteUnsaved(unsavedUser._id)}>
                      <Icon name='delete' />
                    </Button>
                  </Table.Cell>
                  <Table.Cell>{unsavedUser.name}</Table.Cell>
                </Table.Row>))}
            </Table.Body>

            <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' negative icon labelPosition='left' primary size='small' onClick={deleteUser} disabled={userSelected.length === 0}>
                    <Icon name='user delete' /> Delete User(s)
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Search
            minCharacters={1}
            loading={isLoadingUser}
            onResultSelect={handleResultsSelect}
            onSearchChange={handleSearchChange}
            results={userOptions}
            value={valueUser}
          />
          <Divider hidden />
          <Button positive fluid onClick={addUser} disabled={userList.length === 0}>Confirm to add Users to Class</Button>
        </React.Fragment>
      }
      {(!edit || roles.indexOf('SuperAdmin') === -1) &&
      <Table compact celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='1'>No.</Table.HeaderCell>
            <Table.HeaderCell width='12'>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {overallClassData.users.length !== 0 &&
        <Table.Body>
          {overallClassData.users.map((User, i) => (
            <Table.Row key={`user-${i}`}>
              <Table.Cell>{i + 1}</Table.Cell>
              <Table.Cell>{User.name}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        }
        {overallClassData.users.length === 0 &&
        <Table.Body>
          <Table.Row key={`empty-user`}>
            <Table.Cell>1</Table.Cell>
            <Table.Cell>Oops! No Volunteers Found!</Table.Cell>
          </Table.Row>
        </Table.Body>
        }
      </Table>
      }
    </React.Fragment>
  )
}

UserList.propTypes = {
  state: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  getClass: PropTypes.func.isRequired
}

export default UserList
