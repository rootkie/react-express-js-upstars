import React, { useReducer } from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Table, Form, Dimmer, Loader, Grid, Search } from 'semantic-ui-react'
import axios from 'axios'

const initialState = {
  value: '',
  results: [],
  id: '',
  redirect: false,
  isLoadingSearch: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'resetSearch':
      return {
        ...state,
        value: '',
        result: [],
        isLoadingSearch: false
      }
    case 'startSearch':
      return {
        ...state,
        isLoadingSearch: true,
        value: action.value
      }
    case 'endSearch':
      return {
        ...state,
        isLoadingSearch: false,
        results: action.results
      }
    case 'redirect':
      return {
        ...state,
        redirect: true,
        id: action.result.id
      }
    default:
      return state
  }
}

const handleSearchChange = dispatch => async (e, { value }) => {
  if (value.length < 1) return resetComponent(dispatch)
  dispatch({ type: 'startSearch', value })
  const response = await axios.get(`otherStudentsResponsive/${value}`)
  const studentList = response.data.studentsFiltered.map(student => {
    return {
      title: student.name,
      id: student._id,
      key: student._id
    }
  })
  dispatch({ type: 'endSearch', results: studentList })
}

const resetComponent = (dispatch) => dispatch({ type: 'resetSearch' })

const handleResultSelect = dispatch => (e, { result }) => {
  dispatch({ type: 'redirect', result })
}

/*
==========
RENDER
==========
*/
const StudentViewOthers = ({ studentData, isLoading }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { value, results, id, redirect, isLoadingSearch } = state
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
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Group inline style={{ marginBottom: 0 }}>
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
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Gender</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              {studentData.length !== 0 &&
                <Table.Body>
                  {studentData.map((student, i) => (
                    <Table.Row key={`student-${i}`}>
                      <Table.Cell><Link to={`/dashboard/students/edit/${student._id}`}>{student.name}</Link></Table.Cell>
                      <Table.Cell>{student.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
                      <Table.Cell>{student.status}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
              }
              {studentData.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-otherstudent`}>
                    <Table.Cell>Oops! No Student found in these criteria!</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                  </Table.Row>
                </Table.Body>
              }
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

StudentViewOthers.propTypes = {
  studentData: PropTypes.array.isRequired,
  isLoading: PropTypes.bool
}
export default StudentViewOthers
