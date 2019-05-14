import React, { useReducer } from 'react'
import { Dimmer, Loader, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import StudentUserForm from './shared/StudentUserForm'
import moment from 'moment'
import axios from 'axios'

let userNoAttendance = {
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
  userSelector: '',
  error: '',
  attendanceFormattedData: userNoAttendance
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
        userSelector: ''
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

const AttendanceUser = ({classData}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  /*
  ============
  FUNCTIONS
  ============
  */
  const formatUserAttendance = (rawUserData) => {
    let attendances = []
    for (const [index, attendanceData] of rawUserData.userAttendance.entries()) {
      attendances[index] = {
        className: attendanceData.className[0],
        date: moment(attendanceData.date).format('DD/MM/YYYY'),
        type: attendanceData.classType,
        hours: attendanceData.duration,
        classId: attendanceData.classId[0],
        status: attendanceData.status
      }
    }
    const user = {
      total: rawUserData.total,
      attended: rawUserData.attended,
      totalHours: rawUserData.totalHours,
      percentage: parseFloat(rawUserData.percentage).toFixed(2),
      attendances: attendances
    }
    return user
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch({type: 'startSubmit'})
    const { startDate, endDate, classSelector, userSelector } = state

    if (!userSelector) {
      return dispatch({type: 'setError', error: 'Please provide a user to search for!'})
    }
    const sdate = moment(startDate).format('[/]DDMMYYYY')
    const edate = moment(endDate).format('[-]DDMMYYYY')
    try {
      const response = await axios.get('attendance/user/' + userSelector + sdate + edate + '/' + classSelector)
      const { attendances } = response.data
      if (attendances.length > 0) {
        const attendanceFormattedData = formatUserAttendance(attendances[0])
        dispatch({type: 'updateField', name: 'attendanceFormattedData', value: attendanceFormattedData})
      } else {
        dispatch({type: 'updateField', name: 'attendanceFormattedData', value: userNoAttendance})
      }
    } finally {
      dispatch({type: 'updateField', name: 'isLoading', value: false})
    }
  }
  /*
  ============
  RENDER
  ============
  */
  const { isLoading } = state
  if (isLoading) {
    return (
      <Dimmer inverted active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <StudentUserForm state={state} dispatch={dispatch} classData={classData} handleSubmit={handleSubmit} userType='user' />
    </Grid>
  )
}

AttendanceUser.propTypes = {
  classData: PropTypes.array.isRequired
}

export default AttendanceUser
