import React, { useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm, Dimmer, Loader, Grid, Search } from 'semantic-ui-react'
import moment from 'moment'
import axios from 'axios'
import { filterData } from '../../utils'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

const initialState = {
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

const reducer = (state, action) => {
  switch (action.type) {
    case 'setVolunteerData':
      return {
        ...state,
        volunteerData: action.volunteerData,
        editedData: action.editedData,
        isLoading: false
      }
    case 'startLoadingSearch':
      return {
        ...state,
        isLoadingSearch: true,
        value: action.value
      }
    case 'resetSearch':
      return {
        ...state,
        isLoadingSearch: false,
        results: [],
        value: ''
      }
    case 'completeSearch':
      return {
        ...state,
        isLoadingSearch: false,
        results: action.volunteerList
      }
    case 'redirectUser':
      return {
        ...state,
        id: action.id,
        redirect: true
      }
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'clearAll':
      return {
        ...state,
        value: '',
        genderSelector: [],
        results: [],
        editedData: state.volunteerData
      }
    default:
      return state
  }
}

const getVolunteers = (dispatch) => {
  axios.get('/users')
    .then(response => {
      const volunteerData = response.data.users
      const editedData = [...response.data.users]
      dispatch({type: 'setVolunteerData', volunteerData, editedData})
    })
}

const handleDelete = async (state, dispatch) => {
  const { selected } = state
  dispatch({type: 'updateField', name: 'isLoading', value: true})
  if (selected.length === 0) return
  await axios.delete('/admin/user',
    {
      data: {
        userId: selected
      }
    })
  getVolunteers(dispatch)
  dispatch({type: 'updateField', name: 'selected', value: []})
  dispatch({type: 'updateField', name: 'deleteConfirmationVisibility', value: false})
}

const VolunteerView = ({roles}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getVolunteers(dispatch)
  }, [])

  const handleSearchChange = (e, { value }) => {
    if (value.length < 1) return dispatch({type: 'resetSearch'})
    dispatch({type: 'startLoadingSearch', value})
    axios.get(`usersResponsive/${value}`)
      .then(response => {
        const volunteerList = response.data.users.map(user => {
          return {
            title: user.name,
            id: user._id,
            key: user._id
          }
        })
        dispatch({type: 'completeSearch', volunteerList})
      })
  }

  const handleResultSelect = (e, { result }) => {
    dispatch({type: 'redirectUser', id: result.id})
  }

  const handleCheckboxChange = (e, { name: _id, checked }) => {
    const { selected } = state
    const newSelection = checked ? [...selected, _id] : selected.filter(element => element !== _id)
    dispatch({type: 'updateField', name: 'selected', value: newSelection})
  }

  const handleChange = (e, { name, value }) => dispatch({type: 'updateField', name, value})

  const toggleOptions = () => dispatch({ type: 'updateField', name: 'moreOptions', value: !state.moreOptions })

  const handleDeleteConfirmation = (option) => async e => {
    e.preventDefault()
    switch (option) {
      case 'show':
        dispatch({type: 'updateField', name: 'deleteConfirmationVisibility', value: true})
        break
      case 'confirm':
        await handleDelete(state, dispatch)
        break
      case 'cancel':
        dispatch({type: 'updateField', name: 'deleteConfirmationVisibility', value: false})
        break
      default:
    }
  }

  const handleFilter = (e) => {
    e.preventDefault()
    const { genderSelector, volunteerData } = state
    const options = [{field: 'gender', value: genderSelector}]
    if (genderSelector.length !== 0) {
      const editedData = filterData(volunteerData, options)
      dispatch({ type: 'updateField', name: 'editedData', value: editedData })
    }
  }

  const clearAll = e => {
    e.preventDefault()
    dispatch({type: 'clearAll'})
  }

  const { selected, isLoadingSearch, deleteConfirmationVisibility, moreOptions, genderSelector, isLoading, editedData, redirect, id, results, value } = state
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading data</Loader>
      </Dimmer>
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
                            onResultSelect={handleResultSelect}
                            onSearchChange={handleSearchChange}
                            results={results}
                            value={value}
                          />
                        </Form.Group>
                        <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={toggleOptions} />
                      </div>
                      {moreOptions && <div>
                        <Form.Field style={{paddingTop: '10px'}}>
                          <label>Filter by Gender</label>
                          <Dropdown name='genderSelector' value={genderSelector} placeholder='Male or Female' selection options={genderOptions} onChange={handleChange} />
                        </Form.Field>
                        <Form.Group>
                          <Form.Button onClick={handleFilter}>Filter results</Form.Button>
                          <Form.Button color='red' onClick={clearAll}>Clear all</Form.Button>
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
                        <Checkbox name={user._id} onChange={handleCheckboxChange} checked={selected.includes(user._id)} />
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
                        <Button size='small' disabled={selected.length === 0} negative onClick={handleDeleteConfirmation('show')}>Delete</Button>
                        <Confirm
                          open={deleteConfirmationVisibility}
                          header='Deleting the following students:'
                          content={selected.map((id) => (
                            editedData.filter((user) => (user._id === id))[0].name
                          )).join(', ')}
                          onCancel={handleDeleteConfirmation('cancel')}
                          onConfirm={handleDeleteConfirmation('confirm')}
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

VolunteerView.propTypes = {
  roles: PropTypes.array.isRequired
}

export default VolunteerView
