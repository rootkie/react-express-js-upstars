import React, { useReducer } from 'react'
import { Dimmer, Loader, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import moment from 'moment'
import StudentUserForm from './shared/StudentUserForm'
import axios from 'axios'

const studentNoAttendance = {
  total: 'Oops! No Attendance Records Found!',
  attended: 'Change your search parameters!',
  totalHours: 'nil',
  percentage: 0,
  attendances: [{
    className: 'nil',
    date: 'nil',
    type: 'nil',
    hours: 'nil',
    classId: 'nil ',
    status: 0
  }]
}

const initialState = {
  startDate: undefined,
  endDate: undefined,
  moreOptions: false,
  isLoading: false,
  results: [],
  value: '',
  isLoadingSearch: false,
  classSelector: '',
  studentSelector: '',
  error: '',
  attendanceFormattedData: studentNoAttendance
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'resetSearchBar':
      return {
        ...state,
        isLoadingSearch: false,
        results: [],
        studentSelector: ''
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
    case 'startSubmit':
      return {
        ...state,
        isLoading: true,
        error: ''
      }
    case 'setError':
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

const AttendanceStudent = ({classData}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  /*
  =============
  FUNCTIONS
  =============
  */
  const formatStudentAttendance = (rawStudentData) => {
    let attendances = []
    for (const [index, attendanceData] of rawStudentData.studentAttendance.entries()) {
      attendances[index] = {
        className: attendanceData.className[0],
        date: moment(attendanceData.date).format('DD/MM/YYYY'),
        type: attendanceData.classType,
        hours: attendanceData.duration,
        classId: attendanceData.classId[0],
        status: attendanceData.status
      }
    }
    // Compilation of the overall statistics of a student
    // Note, the total hours is only calculated based on the date range given. Any attendance outside of it is not shown.
    const student = {
      total: rawStudentData.total,
      attended: rawStudentData.attended,
      totalHours: rawStudentData.totalHours,
      percentage: rawStudentData.percentage,
      attendances: attendances
    }
    return student
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch({type: 'startSubmit'})
    const { startDate, endDate, classSelector, studentSelector } = state

    if (!studentSelector) {
      return dispatch({type: 'setError', error: 'Please provide a student to search for!'})
    }
    const sdate = moment(startDate).format('[/]DDMMYYYY')
    const edate = moment(endDate).format('[-]DDMMYYYY')
    try {
      const response = await axios.get('attendance/student/' + studentSelector + sdate + edate + '/' + classSelector)
      const { attendances } = response.data
      if (attendances.length > 0) {
        const attendanceFormattedData = formatStudentAttendance(attendances[0])
        dispatch({type: 'updateField', name: 'attendanceFormattedData', value: attendanceFormattedData})
      } else {
        dispatch({type: 'updateField', name: 'attendanceFormattedData', value: studentNoAttendance})
      }
    } finally {
      dispatch({type: 'updateField', name: 'isLoading', value: false})
    }
  }

  /*
  ===========
  RENDER
  ===========
  */
  const { isLoading } = state
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <StudentUserForm state={state} dispatch={dispatch} classData={classData} handleSubmit={handleSubmit} userType='student' />
    </Grid>
  )
}

AttendanceStudent.propTypes = {
  classData: PropTypes.array.isRequired
}

export default AttendanceStudent
