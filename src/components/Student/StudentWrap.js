import React, { useEffect, useReducer } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import StudentForm from './StudentForm'
import StudentView from './StudentView'
import StudentEdit from './StudentEdit'
import StudentViewOthers from './StudentViewOthers'
import axios from 'axios'
import ErrorPage from '../Error/ErrorPage'

const initialState = {
  studentData: [],
  otherStudentData: [],
  isLoading: true
}

/*
  ============================================================================
  Loading of initial Student data
  ============================================================================
*/
const getStudents = async (dispatch, source) => {
  const response = await axios.get('students', { cancelToken: source.token })
  dispatch({ type: 'studentLoaded', studentData: response.data.students })
}

const getOtherStudents = async (dispatch, source) => {
  const response = await axios.get('otherStudents', { cancelToken: source.token })
  dispatch({ type: 'otherStudentLoaded', otherStudentData: response.data.students })
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'startLoading':
      return {
        ...state,
        isLoading: true
      }
    case 'studentLoaded':
      return {
        ...state,
        studentData: action.studentData,
        isLoading: false
      }
    case 'otherStudentLoaded':
      return {
        ...state,
        otherStudentData: action.otherStudentData
      }
    default:
      return state
  }
}

const StudentWrap = ({ roles, match }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const source = axios.CancelToken.source()

  useEffect(() => {
    getStudents(dispatch, source)
    if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
      getOtherStudents(dispatch, source)
    }
    return () => {
      source.cancel('API cancelled')
    }
  }, [])

  const deleteStudent = async (studentId) => {
    dispatch({ type: 'startLoading' })
    await axios.delete('/students',
      {
        data: {
          studentId
        }
      })
    getStudents(dispatch, source)
    if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
      getOtherStudents(dispatch, source)
    }
  }

  const addStudent = async studentData => {
    const response = await axios.post('/admin/students', studentData)
    getStudents(dispatch, source)
    return response.data.newStudentId
  }

  const editStudent = async (studentId, studentData) => {
    await axios.put('/students', { ...studentData, studentId })
    getStudents(dispatch, source)
    if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
      getOtherStudents(dispatch, source)
    }
  }

  const { studentData, otherStudentData, isLoading } = state
  return (
    <React.Fragment>
      <Switch>
        <Route exact path={`${match.path}/add`} render={() => <StudentForm addStudent={addStudent} />} />
        <Route exact path={`${match.path}/edit/:id`} render={props => <StudentEdit roles={roles} editStudent={editStudent} {...props} />} />
        <Route exact path={`${match.path}/view`} render={() => <StudentView studentData={studentData} isLoading={isLoading} roles={roles} deleteStudent={deleteStudent} />} />
        <Route exact path={`${match.path}/viewOthers`} render={() => <StudentViewOthers studentData={otherStudentData} isLoading={isLoading} />} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
      <Grid>
        <Grid.Row></Grid.Row>
      </Grid>
    </React.Fragment>
  )
}

StudentWrap.propTypes = {
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default StudentWrap
