import React, { useEffect, useReducer } from 'react'
import { Table, Form, Dropdown, Icon, Loader, Dimmer, Grid } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'
import moment from 'moment'
import axios from 'axios'
import { Link } from 'react-router-dom'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

const initialState = {
  startDate: undefined,
  endDate: undefined,
  moreOptions: false,
  classSelector: '',
  isLoading: true,
  attendances: []
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'initAttendance':
      return {
        ...state,
        attendances: action.attendances,
        isLoading: false
      }
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'clearField':
      return {
        ...state,
        startDate: undefined,
        endDate: undefined,
        classSelector: ''
      }
    default:
      return state
  }
}

const getInitialAttendance = async (dispatch) => {
  const response = await axios.get('/attendance/class/dateStart/dateEnd')
  const { foundAttendances } = response.data
  dispatch({ type: 'initAttendance', attendances: foundAttendances })
}

const AttendanceSearch = ({ classData }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getInitialAttendance(dispatch)
  }, [])

  /*
  ============
  FUNCTIONS
  ============
  */

  const handleSearch = e => {
    e.preventDefault()
    dispatch({ type: 'updateField', name: 'isLoading', value: true })
    const { startDate, endDate, classSelector } = state
    /*
      Special formating is done below to fit the API call: /attendance/class/:classId?/dateStart/:dateStart?/dateEnd/:dateEnd?
      Case 1: startDate is not given, optional field ':dateStart?' will be empty and backend ignores this search requirement
      Case 2: endDate is also optional, like startDate
      Case 3: class is also optional
      So an API like '/attendance/class/dateStart/dateEnd/' will simply return every single attendance records of every class. (Limit to 200)
      For more info visit the Wiki: https://github.com/rootkie/react-express-js-upstars/wiki/Attendance#3-get-attendance-for-admin-and-superadmin
    */

    // moment format adds the slash (/) while formatting. Refer to https://momentjs.com/docs/#/displaying/format/ under Escaping characters
    const startDateFormat = (startDate) ? moment(startDate).format('[/]DDMMYYYY') : ''
    const endDateFormat = (endDate) ? moment(endDate).format('[/]DDMMYYYY') : ''
    const classSelectorFormat = (classSelector.length > 0) ? '/' + classSelector : classSelector

    axios.get('/attendance/class' + classSelectorFormat + '/dateStart' + startDateFormat + '/dateEnd' + endDateFormat)
      .then(response => {
        const { foundAttendances } = response.data
        dispatch({ type: 'initAttendance', attendances: foundAttendances })
      })
  }

  // Used to add a class as an additional filter
  const getAttendance = (e, { value }) => dispatch({ type: 'updateField', name: 'classSelector', value })

  const clear = e => {
    e.preventDefault()
    dispatch({ type: 'clearField' })
  }
  /*
  ==========
  RENDER
  ==========
  */
  const { moreOptions, classSelector, attendances, isLoading, endDate, startDate } = state

  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <Table celled striped unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='6'>
                  <Form>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Form.Group inline style={{ marginBottom: 0 }}>
                        <Form.Field style={datePickingStyle}>
                          <label>Starting Date</label>
                          <DatePicker
                            dateFormat='dd/MM/yyyy'
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode='select'
                            selected={startDate}
                            maxDate={endDate}
                            onChange={date => dispatch({ type: 'updateField', name: 'startDate', value: date })}
                            placeholderText='Click to select' />
                        </Form.Field>
                        <Form.Field style={datePickingStyle}>
                          <label>Ending Date</label>
                          <DatePicker
                            dateFormat='dd/MM/yyyy'
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode='select'
                            selected={endDate}
                            minDate={startDate}
                            onChange={date => dispatch({ type: 'updateField', name: 'endDate', value: date })}
                            placeholderText='Click to select' />
                        </Form.Field>
                        <Form.Button positive onClick={handleSearch}>Search attendance records</Form.Button>
                        <Form.Button negative onClick={clear}>Clear all fields</Form.Button>
                      </Form.Group>
                      <Icon style={{ cursor: 'pointer' }} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={() => dispatch({ type: 'updateField', name: 'moreOptions', value: !moreOptions })} />
                    </div>
                    {moreOptions && <div>
                      <Form.Field style={{ paddingTop: '10px' }}>
                        <label>Classes</label>
                        <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters={0} options={classData} onChange={getAttendance} clearable />
                      </Form.Field>
                    </div>}
                  </Form>
                </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell>Index</Table.HeaderCell>
                <Table.HeaderCell>Class Name</Table.HeaderCell>
                <Table.HeaderCell>Lesson Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Hours</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            {attendances.length !== 0 &&
              <Table.Body>
                {attendances.map((attendance, i) => (
                  <Table.Row key={`attendance-${attendance._id}`}>
                    <Table.Cell collapsing>{i + 1}</Table.Cell>
                    <Table.Cell><Link to={'/dashboard/attendance/view/' + attendance._id}>{attendance.class.className}</Link></Table.Cell>
                    <Table.Cell>{moment(attendance.date).format('DD/MM/YYYY')}</Table.Cell>
                    <Table.Cell>{attendance.type}</Table.Cell>
                    <Table.Cell>{attendance.hours}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
            }
            {attendances.length === 0 &&
              <Table.Body>
                <Table.Row key={`empty-attendance`}>
                  <Table.Cell collapsing>1</Table.Cell>
                  <Table.Cell>Oops! No Attendance Found!</Table.Cell>
                  <Table.Cell>nil</Table.Cell>
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

AttendanceSearch.propTypes = {
  classData: PropTypes.array.isRequired
}

export default AttendanceSearch
