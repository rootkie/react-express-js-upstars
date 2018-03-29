import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header, Pagination, Dimmer, Loader } from 'semantic-ui-react'
import { array } from 'prop-types'
import moment from 'moment'
import axios from 'axios'

class AttendanceClass extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  constructor (props) {
    super(props)
    // Basic Stats contains the non-changing details as well as the filtered dates to be displayed
    // student and tutor attendance contains filtered attendance data taking account of the pages and number to be displayed.
    this.state = {
      classSelector: '',
      basicStats: {
        'studentNumber': 0,
        'tutorNumber': 0,
        'studentTutorRatio': 0
      },
      totalPages: 1,
      activePage: 1,
      rawClassData: [],
      studentAttendance: [],
      tutorAttendance: [],
      isLoading: false
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({isLoading: true})
    axios.get(`/attendance/${this.state.classSelector}/summary`)
      .then(response => {
        // Calculate pages required by rounding up the number divided by 6 (6 sets of data / page)
        let pagesRequired = Math.ceil(response.data.attendanceDates.length / 6)
        let rawClassData = response.data
        let editedClassData = this.processData(rawClassData, 1)
        this.setState({
          basicStats: editedClassData.basicStats,
          totalPages: pagesRequired,
          studentAttendance: editedClassData.studentAttendance,
          tutorAttendance: editedClassData.tutorAttendance,
          rawClassData,
          isLoading: false
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  processData = (rawData, activePage) => {
    // They calculate the index so that we can slice off the necesary data based on the current page user selects
    const indexOfLast = activePage * 6
    const indexOfFirst = indexOfLast - 6
    let attendanceDates = rawData.attendanceDates.slice(indexOfFirst, indexOfLast)
    let basicStats = {
      studentNumber: rawData.studentNumber,
      tutorNumber: rawData.tutorNumber,
      studentTutorRatio: rawData.studentTutorRatio,
      status: rawData.status,
      attendanceDates
    }
    let studentAttendance = rawData.compiledStudentAttendance.map((user, index) => {
      return {
        details: user.details.slice(indexOfFirst, indexOfLast),
        attended: user.attended,
        percentage: user.percentage,
        studentName: user.studentName[0],
        studentID: user.studentID,
        total: user.total
      }
    })
    let tutorAttendance = rawData.compiledUserAttendance.map((user, index) => {
      return {
        details: user.details.slice(indexOfFirst, indexOfLast),
        attended: user.attended,
        percentage: user.percentage,
        userName: user.userName[0],
        userID: user.userID,
        total: user.total
      }
    })
    return {
      studentAttendance,
      tutorAttendance,
      basicStats
    }
  }

  handlePaginationChange = (e, { activePage }) => {
    e.preventDefault()
    this.setState({isLoading: true})
    // Here, the same processData function is called.
    let editedClassData = this.processData(this.state.rawClassData, activePage)
    this.setState({
      basicStats: editedClassData.basicStats,
      studentAttendance: editedClassData.studentAttendance,
      tutorAttendance: editedClassData.tutorAttendance,
      activePage,
      isLoading: false
    })
  }

  // Real-time API call to search for the data.
  handleSearchOptions = (e, { name, value }) => {
    this.setState({[name]: value})
  }

  render () {
    const { classSelector, basicStats, totalPages, studentAttendance, tutorAttendance, isLoading } = this.state
    const { classData } = this.props

    return (
      <div>
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Field required>
                    <label>Class</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Select a class to view the report' search fluid selection minCharacters={0} options={classData} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  <Form.Button positive fluid disabled={!classSelector}>Retrieve class attendance summary</Form.Button>
                </Form>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>
        <Header>
          <Icon name='bar chart' />
          <Header.Content>
            Basic class statistics
          </Header.Content></Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student No.</Table.HeaderCell>
              <Table.HeaderCell>Tutor No.</Table.HeaderCell>
              <Table.HeaderCell>Student - Tutor Ratio</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell collapsing>{basicStats.studentNumber}</Table.Cell>
              <Table.Cell collapsing>{basicStats.tutorNumber}</Table.Cell>
              <Table.Cell collapsing>{basicStats.studentTutorRatio}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header>
          <Icon name='line graph' />
          <Header.Content>
            Full Attendance Records
          </Header.Content>
        </Header>
        {/* 11 columns (5 for basic data and 6 for attendance records per page) */}
        {/* 6 sets is tested on computer resolutions of min 1280 x 720 to be able to see everything */}
        <Table celled striped columns={11}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Total Class</Table.HeaderCell>
              <Table.HeaderCell>No. attendeed</Table.HeaderCell>
              <Table.HeaderCell>Percentage</Table.HeaderCell>
              {/* Display attendance dates (6 sets per page) */}
              {basicStats.status === 'success' && basicStats.attendanceDates.map((date, index) => (
                <Table.HeaderCell>{moment(date.date).format('L')}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {/* nested maps allow the various details to be displayed out in order */}
            {basicStats.status === 'success' && studentAttendance.map((attendance, index) => (
              <Table.Row key={`attendanceStudent-${index}`}>
                <Table.Cell>{attendance.studentName}</Table.Cell>
                <Table.Cell>Student</Table.Cell>
                <Table.Cell>{attendance.total}</Table.Cell>
                <Table.Cell>{attendance.attended}</Table.Cell>
                <Table.Cell>{(attendance.percentage * 100).toFixed(2)}%</Table.Cell>
                {attendance.details.map((individualStatus, index) => (
                  <Table.Cell>{individualStatus}</Table.Cell>
                ))}
              </Table.Row>
            ))}
            {basicStats.status === 'success' && tutorAttendance.map((attendance, index) => (
              <Table.Row key={`attendanceUser-${index}`} positive>
                <Table.Cell>{attendance.userName}</Table.Cell>
                <Table.Cell>Tutor</Table.Cell>
                <Table.Cell>{attendance.total}</Table.Cell>
                <Table.Cell>{attendance.attended}</Table.Cell>
                <Table.Cell>{(attendance.percentage * 100).toFixed(2)}%</Table.Cell>
                {attendance.details.map((individualStatus, index) => (
                  <Table.Cell>{individualStatus}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='11'>
                <Pagination defaultActivePage={1} totalPages={totalPages} floated='right' onPageChange={this.handlePaginationChange} />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    )
  }
}

export default AttendanceClass
