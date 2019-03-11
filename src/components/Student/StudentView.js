import React, { useReducer } from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Confirm, Dimmer, Loader, Grid, Search } from 'semantic-ui-react'
import moment from 'moment'
import axios from 'axios'

const inlineStyle = {
  confirm: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

const initialState = {
  selected: [],
  deleteConfirmationVisibility: false,
  value: '',
  results: [],
  id: '',
  isLoadingSearch: false,
  redirect: false
}

// Below are all Misc functions to help the main function
const resetComponent = dispatch => dispatch({type: 'resetSearch'})

const handleSearchChange = dispatch => async (e, { value }) => {
  dispatch({type: 'startSearch', value})
  // If no search string, do not call the API, just reset to default
  if (value.length < 1) return resetComponent(dispatch)
  try {
    const response = await axios.get(`studentsResponsive/${value}`)
    let studentList = response.data.studentsFiltered.map(student => {
      return {
        title: student.profile.name,
        id: student._id,
        key: student._id
      }
    })
    dispatch({type: 'completedSearch', results: studentList})
  } catch (err) {
    console.log(err)
  }
}

const handleResultSelect = dispatch => (e, { result }) => {
  dispatch({type: 'selectResult', id: result.id})
}

// Reducers are here
const reducer = (state, action) => {
  switch (action.type) {
    case 'resetSearch':
      return {
        ...state,
        value: '',
        results: [],
        isLoadingSearch: false
      }
    case 'startSearch':
      return {
        ...state,
        isLoadingSearch: true,
        value: action.value
      }
    case 'completedSearch':
      return {
        ...state,
        isLoadingSearch: false,
        results: action.results
      }
    case 'selectResult':
      return {
        ...state,
        redirect: true,
        id: action.id
      }
    case 'handleCheckbox':
      return {
        ...state,
        selected: action.newSelected
      }
    case 'resetSelected':
      return {
        ...state,
        selected: [],
        deleteConfirmationVisibility: false
      }
    case 'showConfirmMenu':
      return {
        ...state,
        deleteConfirmationVisibility: true
      }
    case 'hideConfirmMenu':
      return {
        ...state,
        deleteConfirmationVisibility: false
      }
    default:
      return state
  }
}

// Main function to render the DOM
const StudentView = ({studentData, isLoading, roles, deleteStudent}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ===============================================
  // Some Functions are better placed inside
  // ===============================================
  const handleCheckboxChange = (e, { name: _id, checked }) => { // name here is actually the ID of the student
    const { selected } = state
    let newSelected
    if (checked) {
      newSelected = [...selected, _id]
    } else {
      newSelected = selected.filter(element => element !== _id)
    }
    dispatch({type: 'handleCheckbox', newSelected})
  }

  const handleDelete = () => {
    const { selected } = state
    selected.length > 0 && deleteStudent(selected)
    dispatch({type: 'resetSelected'})
  }

  const handleDeleteConfirmation = (option) => () => {
    switch (option) {
      case 'show':
        dispatch({type: 'showConfirmMenu'})
        break
      case 'confirm':
        handleDelete()
        break
      case 'cancel':
        dispatch({type: 'hideConfirmMenu'})
        break
      default:
    }
  }

  const { selected, results, id, deleteConfirmationVisibility, value, redirect, isLoadingSearch } = state
  if (isLoading) {
    return (
      <div>
        <Dimmer active>
          <Loader indeterminate>Loading data</Loader>
        </Dimmer>
      </div>
    )
  } else if (redirect && id.length !== 0) {
    return <Redirect push to={`/dashboard/students/edit/${id}`} />
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
                            onResultSelect={handleResultSelect(dispatch)}
                            onSearchChange={handleSearchChange(dispatch)}
                            results={results}
                            value={value}
                          />
                        </Form.Group>
                      </div>
                    </Form>
                  </Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                  {roles.indexOf('SuperAdmin') !== -1 && studentData.length !== 0 &&
                    <Table.HeaderCell />
                  }
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Age</Table.HeaderCell>
                  <Table.HeaderCell>IC Number</Table.HeaderCell>
                  <Table.HeaderCell>Gender</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              {studentData.length !== 0 &&
                <Table.Body>
                  {studentData.map((student, i) => (
                    <Table.Row key={`student-${i}`}>
                      {roles.indexOf('SuperAdmin') !== -1 && studentData.length !== 0 &&
                      <Table.Cell collapsing>
                        <Checkbox name={student._id} onChange={handleCheckboxChange} checked={selected.includes(student._id)} />
                      </Table.Cell>
                      }
                      <Table.Cell><Link to={`/dashboard/students/edit/${student._id}`}>{student.name}</Link></Table.Cell>
                      <Table.Cell>{moment().diff(student.dob, 'years')}</Table.Cell>
                      <Table.Cell>{student.icNumber}</Table.Cell>
                      <Table.Cell>{student.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
              }
              {studentData.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-student`}>
                    <Table.Cell>Oops! No Students Found!</Table.Cell>
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
                        <Link to='/dashboard/students/add'>
                          <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                            <Icon name='user' />New Student
                          </Button>
                        </Link>
                        <Button size='small' disabled={selected.length === 0} negative onClick={handleDeleteConfirmation('show')}>Delete</Button>
                        <Confirm
                          open={deleteConfirmationVisibility}
                          header='Deleting the following students:'
                          content={selected.map((id) => (
                            studentData.filter((student) => (student._id === id))[0].name
                          )).join(', ')}
                          onCancel={handleDeleteConfirmation('cancel')}
                          onConfirm={handleDeleteConfirmation('confirm')}
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

StudentView.propTypes = {
  studentData: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  roles: PropTypes.array.isRequired,
  deleteStudent: PropTypes.func.isRequired
}

export default StudentView
