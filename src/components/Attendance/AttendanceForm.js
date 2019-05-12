import React, { useReducer } from 'react'
import { Form, Message, Loader, Dimmer, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import AddEditForm from './shared/AddEditForm'
import { object, string, date, number } from 'yup'
import axios from 'axios'

// Note: classSelection is a bool that tracks if any class is provided by the user.
const initialState = {
  attendanceDate: undefined,
  className: '',
  type: 'Class',
  hours: '',
  students: [{text: 'Select class to view sudents', key: '0'}],
  users: [{text: 'Select class to view users', key: '0'}],
  isLoading: false,
  classSelection: false,
  error: ''
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'retrieveData':
      return {
        ...initialState,
        className: action.value,
        isLoading: true,
        error: ''
      }
    case 'initData':
      return {
        ...state,
        users: action.userList,
        students: action.studentList,
        classSelection: true
      }
    case 'changeType':
      return {
        ...state,
        students: action.students,
        users: action.users
      }
    case 'emptyClass':
      return {
        ...state,
        classSelection: false,
        error: 'Attendance can only be created if the class is not empty. Please add some students or users.'
      }
    default:
      return state
  }
}

const AttendanceForm = ({classData, history}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  /*
  ===========
  FUNCTIONS
  ===========
  */
  const handleClass = (e, { value }) => {
    dispatch({type: 'retrieveData', value})
    axios.get('/class/' + value)
      .then(response => {
        const { students, users } = response.data.class
        let userList = []
        let studentList = []
        for (const [index, studentData] of students.entries()) {
          studentList[index] = {
            text: studentData.name,
            student: studentData._id,
            key: studentData._id,
            status: 1
          }
        }

        for (const [index, userData] of users.entries()) {
          userList[index] = {
            text: userData.name,
            user: userData._id,
            key: userData._id,
            status: 1
          }
        }
        dispatch({type: 'initData', userList, studentList})
        if (userList.length === 0 && studentList.length === 0) {
          dispatch({type: 'emptyClass'})
        }
      })
      .finally(() => {
        dispatch({type: 'updateField', name: 'isLoading', value: false})
      })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const { attendanceDate, className, type, students, users, hours } = state
    const requiredFields = object({
      className: string().required('Please provide a valid class name'),
      type: string().required('Was this lesson held? Or was it cancelled?'),
      hours: number().min(0, 'The minimum hour is zero (0)').required('Please provide the number of hours'),
      attendanceDate: date().required('Please provide a valid date')
    })
    requiredFields.validate({
      attendanceDate, className, type, hours
    }).then(async valid => {
      try {
        const response = await axios.post('/attendance',
          {
            date: attendanceDate,
            classId: className,
            users,
            students,
            hours,
            type
          })
        history.push(`/dashboard/attendance/view/${response.data.attendanceId}`)
      } catch (err) {
        dispatch({type: 'updateField', name: 'error', value: err.response.data.error})
      }
    }).catch(err => {
      if (err.name === 'ValidationError') {
        dispatch({type: 'updateField', name: 'error', value: err.errors})
      }
    })
  }
  /*
  ============
  RENDER
  ============
  */
  const { error, classSelection, isLoading } = state
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate active>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <Form onSubmit={handleSubmit}>
            <AddEditForm state={state} dispatch={dispatch} classData={classData} handleClass={handleClass} newAttendance edit />
            <Form.Button disabled={!classSelection} icon='plus' labelPosition='left' content='submit' />
          </Form>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Message
            hidden={error.length === 0}
            icon='exclamation'
            header='Error!'
            negative
            content={error}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

AttendanceForm.propTypes = {
  history: PropTypes.object.isRequired,
  classData: PropTypes.array.isRequired
}

export default AttendanceForm
