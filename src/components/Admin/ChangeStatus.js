import React, { useEffect, useReducer } from 'react'
import { Table, Form, Dimmer, Loader, Message, Grid } from 'semantic-ui-react'
import axios from 'axios'
import StatusAndRoles from './StatusAndRoles'

const initialState = {
  pendingUsers: [],
  activeUsers: [],
  suspendedUsers: [],
  deletedUsers: [],
  error: '',
  searchName: '',
  isLoading: true
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'initData':
      return {
        ...state,
        pendingUsers: action.pendingUsers,
        activeUsers: action.activeUsers,
        suspendedUsers: action.suspendedUsers,
        deletedUsers: action.deletedUsers,
        isLoading: false,
        error: ''
      }
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'refreshData':
      return {
        ...state,
        isLoading: true,
        searchName: '',
        error: ''
      }
    default:
      return state
  }
}

const ChangeStatus = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getData()
  }, [])

  const handleChange = (e, { value }) => {
    dispatch({type: 'updateField', name: 'searchName', value})
  }

  const getData = async () => {
    const [pending, active, suspended, deleted] = await Promise.all(
      [
        axios.get('admin/pendingUsers'),
        axios.get('users'),
        axios.get('admin/suspended'),
        axios.get('admin/deleted')
      ]
    )
    const pendingUsers = pending.data.users
    const activeUsers = active.data.users
    const suspendedUsers = suspended.data.users
    const deletedUsers = deleted.data.users
    dispatch({type: 'initData', pendingUsers, activeUsers, suspendedUsers, deletedUsers})
  }

  const handleFilter = async (e) => {
    const { searchName } = state
    if (searchName.length < 1) {
      refresh(e)
      return
    }
    dispatch({type: 'updateField', name: 'isLoading', value: true})
    const response = await axios.get(`admin/search/${searchName}`)
    const pendingUsers = response.data.pendingMatched
    const activeUsers = response.data.activeMatched
    const suspendedUsers = response.data.suspendedMatched
    const deletedUsers = response.data.deletedMatched
    dispatch({type: 'initData', pendingUsers, activeUsers, suspendedUsers, deletedUsers})
  }

  const refresh = (e) => {
    e.preventDefault()
    dispatch({type: 'refreshData'})
    getData()
  }

  const { isLoading, activeUsers, pendingUsers, suspendedUsers, deletedUsers, error, searchName } = state
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
      <Grid stackable stretched>
        <Grid.Row>
          <Grid.Column>
            <Table compact celled unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell colSpan='5'>
                    <Form>
                      <div style={{display: 'flex'}}>
                        <Form.Group inline style={{marginBottom: 0}}>
                          <Form.Input label='Search by name' placeholder='Leave it empty to view all' name='searchName' value={searchName} icon='search' onChange={handleChange} />
                          <Form.Button onClick={handleFilter}>Filter results</Form.Button>
                          <Form.Button positive onClick={refresh}>Refresh Data / Reset Search</Form.Button>
                        </Form.Group>
                      </div>
                    </Form>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
            </Table>
            <Message
              hidden={error === ''}
              header='Error!'
              icon='exclamation'
              negative
              content={error}
            />
          </Grid.Column>
        </Grid.Row>
        <StatusAndRoles userData={pendingUsers} dispatch={dispatch} userType='Pending' />
        <StatusAndRoles userData={activeUsers} dispatch={dispatch} userType='Active' />
        <StatusAndRoles userData={suspendedUsers} dispatch={dispatch} userType='Suspended' />
        <StatusAndRoles userData={deletedUsers} dispatch={dispatch} userType='Deleted' />
      </Grid>
    )
  }
}

export default ChangeStatus
