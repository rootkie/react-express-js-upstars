import React, { useEffect, useReducer } from 'react'
import { Switch, Route } from 'react-router-dom'
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

const reducer = (state, action) => {
  switch (action.type) {
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

// Some functions are placed here to be ran on render only so that everytime the user changes pages within this wrap,
// the data will not be reloaded and thus saving API calls and loading times.
const StudentWrap = ({roles, match}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Ran only during initial Mounting
  useEffect(() => {
    getStudents(dispatch)
    if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
      getOtherStudents(dispatch)
    }
  }, [])

  /*
  ============================================================================
  Loading of initial Student data
  ============================================================================
  */
  const getStudents = async () => {
    try {
      const response = await axios.get('students')
      dispatch({type: 'studentLoaded', studentData: response.data.students})
    } catch (err) {
      console.log(err)
    }
  }

  const getOtherStudents = async () => {
    try {
      const response = await axios.get('otherStudents')
      dispatch({type: 'otherStudentLoaded', otherStudentData: response.data.students})
    } catch (err) {
      console.log(err)
    }
  }

  const deleteStudent = async (studentId) => {
    try {
      await axios.delete('/students',
        {
          data: {
            studentId
          }
        })
      getStudents()
    } catch (err) {
      console.log(err)
    }
  }

  const { studentData, otherStudentData, isLoading } = state
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/add`} render={() => <StudentForm />} />
        <Route exact path={`${match.path}/edit/:id`} render={props => <StudentEdit roles={roles} {...props} />} />
        <Route exact path={`${match.path}/view`} render={() => <StudentView studentData={studentData} isLoading={isLoading} roles={roles} deleteStudent={deleteStudent} />} />
        <Route exact path={`${match.path}/viewOthers`} render={() => <StudentViewOthers studentData={otherStudentData} isLoading={isLoading} />} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
    </div>
  )
}

StudentWrap.propTypes = {
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default StudentWrap

// const addStudent = async (studentDataToSubmit) => {
//   try {
//     const response = await axios.post('admin/students', studentDataToSubmit)
//     getStudents()
//     return response.data.newStudentId
//   } catch (err) {
//     console.log(err)
//   }
// }

// const editStudent = async (studentDataToSubmit) => {
//   const { sid } = match.params
//   let { roles } = this.props
//   return axios.put('/students', {
//     ...studentDataToSubmit,
//     studentId: sid
//   })
//     .then(response => {
//       this.getStudents()
//       if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
//         this.getOtherStudents()
//       }
//     })
// }
