import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header, Dimmer, Loader, Message } from 'semantic-ui-react'
import { array } from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

let attendanceFormattedData = {
  attendances: [{}]
}

let noResultsStudent = {
  total: 0,
  attended: 0,
  totalHours: 0,
  percentage: 0,
  attendances: [{
    className: '-',
    date: '-',
    type: '-',
    hours: '-',
    classId: '-',
    status: 0
  }]
}

class AttendanceStudent extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  // Everything here is similar to AttendanceUser
  constructor (props) {
    super(props)
    this.state = {
      startDate: null,
      endDate: null,
      moreOptions: false,
      isLoading: true,
      studentOptions: [],
      classSelector: '',
      studentSelector: '',
      error: '',
      attendanceFormattedData
    }
  }

  componentDidMount () {
    // get attendance initial data to be passed to search
    this.getStudents()
  }

  getStudents () {
    axios.get('students')
      .then(response => {
        let studentOptions = []
        console.log(response)
        for (let [index, studentData] of response.data.students.entries()) {
          studentOptions[index] = {
            key: studentData._id,
            text: studentData.profile.name,
            value: studentData._id
          }
        }
        this.setState({studentOptions, isLoading: false})
      }).catch((error) => {
        console.log(error)
      })
  }

  formatStudentAttendance = (rawStudentData) => {
    let attendances = []
    let student = {}
    for (let [index, attendanceData] of rawStudentData.studentAttendance.entries()) {
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
    student = {
      total: rawStudentData.total,
      attended: rawStudentData.attended,
      totalHours: rawStudentData.totalHours,
      percentage: rawStudentData.percentage,
      attendances: attendances
    }
    return student
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true, error: '' })
    let { startDate, endDate, classSelector, studentSelector } = this.state

    if (!studentSelector) {
      this.setState({ error: 'Please provide a student to search for!', isLoading: false })
    } else {
      startDate = moment(startDate).format('[/]YYYYMMDD')
      endDate = moment(endDate).format('[-]YYYYMMDD')
      axios.get('attendance/student/' + studentSelector + startDate + endDate + '/' + classSelector)
        .then(response => {
        // If there are any records, else a default text is shown to inform the user.
          if (response.data.attendances.length > 0) {
            this.setState({attendanceFormattedData: this.formatStudentAttendance(response.data.attendances[0]), isLoading: false})
          } else this.setState({isLoading: false, attendanceData: noResultsStudent})
        }).catch(error => {
          console.log(error)
        })
    }
  }

  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  handleSearchOptions = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  render () {
    const { moreOptions, classSelector, studentSelector, isLoading, studentOptions, attendanceFormattedData, error } = this.state
    const { classData } = this.props

    return (
      <div>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Form onSubmit={this.handleSubmit}>
                  <div id='volunteer-date-wrapper' style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Group inline style={{marginBottom: 0}}>
                      <Form.Field style={datePickingStyle}>
                        <label>Starting Date</label>
                        <DatePicker
                          dateFormat='DD/MM/YYYY'
                          required
                          selected={this.state.startDate}
                          maxDate={this.state.endDate}
                          onChange={(date) => this.handleDateChange('startDate', date)}
                          placeholderText='Click to select' />
                      </Form.Field>
                      <Form.Field style={datePickingStyle}>
                        <label>Ending Date</label>
                        <DatePicker
                          dateFormat='DD/MM/YYYY'
                          required
                          selected={this.state.endDate}
                          minDate={this.state.startDate}
                          onChange={(date) => this.handleDateChange('endDate', date)}
                          placeholderText='Click to select' />
                      </Form.Field>
                      <Form.Button positive>Search student's attendance records</Form.Button>
                    </Form.Group>
                    <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                  </div>
                  <Form.Field required>
                    <label>Students</label>
                    <Dropdown name='studentSelector' value={studentSelector} placeholder='Pick a Student' search minCharacters={0} selection options={studentOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  {moreOptions && <div>
                    <Form.Field style={{paddingTop: '5px'}}>
                      <label>Classes</label>
                      <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters={0} options={classData} onChange={this.handleSearchOptions} />
                    </Form.Field>
                  </div>}

                </Form>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>
        {/* Loading screen that shows during API calls for UX */}
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
        <Message
          hidden={error.length === 0}
          negative
          content={error}
        />
        <Header as='h3' dividing>Student Statistics</Header>
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Attendance Found</Table.HeaderCell>
              <Table.HeaderCell>Attended</Table.HeaderCell>
              <Table.HeaderCell>Total Hours</Table.HeaderCell>
              <Table.HeaderCell>Percentage</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{attendanceFormattedData.total}</Table.Cell>
              <Table.Cell>{attendanceFormattedData.attended}</Table.Cell>
              <Table.Cell>{attendanceFormattedData.totalHours}</Table.Cell>
              <Table.Cell>{attendanceFormattedData.percentage * 100}%</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header as='h3' dividing>Student Attendance</Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Class Name</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Hours</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {attendanceFormattedData.attendances.map((data, i) => (
              <Table.Row>
                <Table.Cell collapsing>{data.className}</Table.Cell>
                <Table.Cell collapsing>{data.date}</Table.Cell>
                <Table.Cell collapsing>{data.type}</Table.Cell>
                <Table.Cell collapsing>{data.hours}</Table.Cell>
                <Table.Cell collapsing>{data.status === 1 ? 'Present' : 'Absent'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default AttendanceStudent
