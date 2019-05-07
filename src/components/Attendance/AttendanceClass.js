import React, { useReducer } from 'react'
import { Table, Form, Dropdown, Icon, Header, Pagination, Dimmer, Loader, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import moment from 'moment'
import axios from 'axios'

const initialState = {
  classSelector: '',
  basicStats: {
    studentNumber: 0,
    tutorNumber: 0,
    studentTutorRatio: 0
  },
  attendanceDates: [],
  totalPages: 1,
  activePage: 1,
  rawClassData: [],
  studentAttendance: [],
  tutorAttendance: [],
  isLoading: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'initAttendance': {
      const {basicStats, totalPages, details, rawClassData} = action
      return {
        ...state,
        ...details,
        basicStats,
        totalPages,
        rawClassData,
        isLoading: false
      }
    }
    case 'handlePage':
      return {
        ...state,
        ...action.details,
        isLoading: false
      }
    default:
      return state
  }
}

const AttendanceClass = ({classData}) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  /*
  ============
  FUNCTIONS
  ============
  */
  const handleSubmit = async e => {
    e.preventDefault()
    const {classSelector} = state
    dispatch({type: 'updateField', name: 'isLoading', value: true})
    const response = await axios.get(`/attendance/${classSelector}/summary`)
    const rawClassData = {...response.data}
    // Calculate pages required by rounding up the number divided by 6 (max 6 sets of data / page)
    const pagesRequired = Math.ceil(rawClassData.attendanceDates.length / 6)
    const { studentNumber, tutorNumber, studentTutorRatio } = rawClassData
    const basicStats = {
      studentNumber,
      tutorNumber,
      studentTutorRatio
    }
    // default to providing attendance data on page one (1)
    const details = processAttendanceByPage(rawClassData, 1)
    dispatch({type: 'initAttendance',
      basicStats,
      totalPages: pagesRequired,
      details,
      rawClassData
    })
  }

  const processAttendanceByPage = (rawClassData, activePage) => {
    const { attendanceDates, compiledStudentAttendance, compiledUserAttendance } = rawClassData
    const indexOfLast = activePage * 6
    const indexOfFirst = indexOfLast - 6
    const studentAttendance = compiledStudentAttendance.map(student => {
      const { details, attended, percentage, studentName, studentID, total } = student
      return {
        status: details.slice(indexOfFirst, indexOfLast),
        attended,
        percentage,
        studentName: studentName[0],
        studentID,
        total
      }
    })
    const tutorAttendance = compiledUserAttendance.map(user => {
      const { details, attended, percentage, userName, userID, total } = user
      return {
        status: details.slice(indexOfFirst, indexOfLast),
        attended,
        percentage,
        userName: userName[0],
        userID,
        total
      }
    })
    return {
      studentAttendance,
      tutorAttendance,
      attendanceDates: attendanceDates.slice(indexOfFirst, indexOfLast)
    }
  }

  const handlePaginationChange = (e, { activePage }) => {
    e.preventDefault()
    dispatch({type: 'updateField', name: 'isLoading', value: true})
    const { rawClassData } = state
    const details = processAttendanceByPage(rawClassData, activePage)
    dispatch({type: 'handlePage', details})
  }

  const handleSearchOptions = (e, { name, value }) => {
    e.preventDefault()
    dispatch({type: 'updateField', name, value})
  }

  /*
  =============
  RENDER
  =============
  */
  const { classSelector, basicStats, totalPages, studentAttendance, tutorAttendance, isLoading, attendanceDates } = state
  const { studentNumber, tutorNumber, studentTutorRatio } = basicStats
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
                <Table.HeaderCell colSpan='4'>
                  <Form onSubmit={handleSubmit}>
                    <Form.Field required>
                      <label>Class</label>
                      <Dropdown name='classSelector' value={classSelector} placeholder='Select a class to view the report' search fluid selection minCharacters={0} options={classData} onChange={handleSearchOptions} />
                    </Form.Field>
                    <Form.Button positive fluid disabled={!classSelector}>Retrieve class attendance summary</Form.Button>
                  </Form>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Header>
            <Icon name='bar chart' />
            <Header.Content>
            Basic class statistics
            </Header.Content></Header>
          <Table celled striped unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Student No.</Table.HeaderCell>
                <Table.HeaderCell>Tutor No.</Table.HeaderCell>
                <Table.HeaderCell>Student - Tutor Ratio</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row>
                <Table.Cell collapsing>{studentNumber}</Table.Cell>
                <Table.Cell collapsing>{tutorNumber}</Table.Cell>
                <Table.Cell collapsing>{studentTutorRatio}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Header>
            <Icon name='line graph' />
            <Header.Content>
            Full Attendance Records
            </Header.Content>
          </Header>
          {/* 11 columns (4 for basic data and 6 for attendance records per page) */}
          {/* 6 sets is tested on computer resolutions of min 1280 x 720 to be able to see everything */}
          <Table celled striped columns={10} unstackable attached>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Student Name</Table.HeaderCell>
                <Table.HeaderCell>Total Class Held</Table.HeaderCell>
                <Table.HeaderCell>No. attended</Table.HeaderCell>
                <Table.HeaderCell>Percentage</Table.HeaderCell>
                {/* Display attendance dates (6 sets per page) */}
                {attendanceDates.map((date) => (
                  <Table.HeaderCell key={date._id}>{moment(date.date).format('ll')} ({date.type})</Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {studentAttendance.map((attendance) => (
                <Table.Row key={`attendanceStudent-${attendance.studentName}`}>
                  <Table.Cell>{attendance.studentName}</Table.Cell>
                  <Table.Cell>{attendance.total}</Table.Cell>
                  <Table.Cell>{attendance.attended}</Table.Cell>
                  <Table.Cell>{(attendance.percentage * 100).toFixed(2)}%</Table.Cell>
                  {attendance.status.map((individualStatus, index) => (
                    <Table.Cell key={index} textAlign='center'>
                      {individualStatus === 1 && <Icon color='green' name='check' size='large' />}
                      {individualStatus === 0 && <Icon color='red' name='close' size='large' />}
                      {individualStatus === '-' && <Icon color='black' name='minus' size='large' />}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
              {studentAttendance.length === 0 &&
              <Table.Row key='empty-student-attendance'>
                <Table.Cell>No Student</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>0.00%</Table.Cell>
                {attendanceDates.map((date, index) => (
                  <Table.Cell key={index}>-</Table.Cell>
                ))}
              </Table.Row>
              }
            </Table.Body>
          </Table>

          <Table celled striped columns={10} unstackable attached>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>User Name</Table.HeaderCell>
                <Table.HeaderCell>Total Class Held</Table.HeaderCell>
                <Table.HeaderCell>No. attended</Table.HeaderCell>
                <Table.HeaderCell>Percentage</Table.HeaderCell>
                {/* Display attendance dates (6 sets per page) */}
                {attendanceDates.map((date) => (
                  <Table.HeaderCell key={date._id}>{moment(date.date).format('ll')} ({date.type})</Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tutorAttendance.map((attendance) => (
                <Table.Row key={`attendanceUser-${attendance.userName}`}>
                  <Table.Cell>{attendance.userName}</Table.Cell>
                  <Table.Cell>{attendance.total}</Table.Cell>
                  <Table.Cell>{attendance.attended}</Table.Cell>
                  <Table.Cell>{(attendance.percentage * 100).toFixed(2)}%</Table.Cell>
                  {attendance.status.map((individualStatus, index) => (
                    <Table.Cell key={index} textAlign='center'>
                      {individualStatus === 1 && <Icon color='green' name='check' size='large' />}
                      {individualStatus === 0 && <Icon color='red' name='close' size='large' />}
                      {individualStatus === '-' && <Icon color='black' name='minus' size='large' />}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
              {tutorAttendance.length === 0 &&
              <Table.Row key='empty-tutor-attendance'>
                <Table.Cell>No Tutor</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>0</Table.Cell>
                <Table.Cell>0.00%</Table.Cell>
                {attendanceDates.map((date, index) => (
                  <Table.Cell key={index}>-</Table.Cell>
                ))}
              </Table.Row>
              }
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='10'>
                  <Pagination defaultActivePage={1} totalPages={totalPages} floated='right' onPageChange={handlePaginationChange} />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

AttendanceClass.propTypes = {
  classData: PropTypes.array.isRequired
}

export default AttendanceClass
