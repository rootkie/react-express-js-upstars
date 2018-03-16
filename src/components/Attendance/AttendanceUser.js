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

// Default response when no results are found
let noResultsUser = {
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

// Judging from the API calls, only superAdmin are allowed to call these without prompting a 403.
// Maybe we can have a page at 'home' to compile the login user's attendance and class.
// This function to search any user's attendance shd be restricted to admin.
class AttendanceUser extends Component {
  static propTypes = {
    classData: array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      startDate: '',
      endDate: '',
      moreOptions: false,
      isLoading: true,
      userOptions: [],
      classSelector: '',
      userSelector: '',
      error: '',
      attendanceFormattedData
    }
  }

  componentDidMount () {
    // get attendance initial user data to be passed to search
    // Most prob fix this using the instant user search API (enhancement future feature)
    this.getUsers()
  }

  getUsers () {
    axios.get('users')
      .then(response => {
        let userOptions = []
        console.log(response)
        // Sort the old array into a new one in the correct key and value.
        for (let [index, userData] of response.data.users.entries()) {
          userOptions[index] = {
            key: userData._id,
            text: userData.profile.name,
            value: userData._id
          }
        }
        console.log(userOptions)
        this.setState({userOptions, isLoading: false})
      }).catch(error => {
        console.log(error)
      })
  }

  // Once the class is selected, the attendance data returned will be parsed through this to sort them.
  formatUserAttendance = (rawUserData) => {
    console.log(rawUserData)
    let attendances = []
    let user = {}
    for (let [index, attendanceData] of rawUserData.userAttendance.entries()) {
      attendances[index] = {
        className: attendanceData.className[0],
        date: moment(attendanceData.date).format('DD/MM/YYYY'),
        type: attendanceData.classType,
        hours: attendanceData.duration,
        classId: attendanceData.classId[0],
        status: attendanceData.status
      }
    }
    // Statistics overall for that user.
    // It also returns the attendance array created above
    user = {
      total: rawUserData.total,
      attended: rawUserData.attended,
      totalHours: rawUserData.totalHours,
      percentage: rawUserData.percentage,
      attendances
    }
    return user
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true, error: '' })
    let { startDate, endDate, classSelector, userSelector } = this.state

    // Checks dropdown for user has a value.
    if (!userSelector) {
      this.setState({ error: 'Please provide a user to search for!', isLoading: false })
    } else {
    // Adds a slash in front of the 8 digit to suit the API URI call
      startDate = moment(startDate).format('[/]YYYYMMDD')
      // Adds a dash between the 2 dates
      endDate = moment(endDate).format('[-]YYYYMMDD')
      axios.get('attendance/user/' + userSelector + startDate + endDate + '/' + classSelector)
        .then(response => {
          if (response.data.attendances.length > 0) this.setState({attendanceFormattedData: this.formatUserAttendance(response.data.attendances[0]), isLoading: false})
          else {
            this.setState({isLoading: false, attendanceFormattedData: noResultsUser})
          }
        }).catch(error => {
          console.log(error)
        })
    }
  }
  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  handleSearchOptions = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  render () {
    const { moreOptions, classSelector, userSelector, isLoading, userOptions, attendanceFormattedData, error } = this.state
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
                      <Form.Button positive>Search user's attendance records</Form.Button>
                    </Form.Group>
                    <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                  </div>
                  <Form.Field required>
                    <label>Volunteers</label>
                    <Dropdown name='userSelector' value={userSelector} placeholder='Pick a Volunteer' search minCharacters='0' selection options={userOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  {moreOptions && <div>
                    <Form.Field style={{paddingTop: '5px'}}>
                      <label>Classes</label>
                      <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters='0' options={classData} onChange={this.handleSearchOptions} />
                    </Form.Field>
                  </div>}

                </Form>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>
        {/* Loading screen while performing API calls */}
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
        {/* Error message to do simple validation that user dropdown is filled */}
        <Message
          hidden={error.length === 0}
          negative
          content={error}
        />

        <Header as='h3' dividing>User Statistics</Header>
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
        <Header as='h3' dividing>User Attendance</Header>
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

export default AttendanceUser
