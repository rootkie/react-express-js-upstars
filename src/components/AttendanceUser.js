import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header, Dimmer, Loader } from 'semantic-ui-react'
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


class AttendanceUser extends Component {
  
  constructor(props) {
    super(props)
  this.state = {
    startDate: '',
    endDate: '',
    moreOptions: false,
    isLoading: true,
    userOptions: [],
    classSelector: '',
    userSelector: '',
    attendanceFormattedData,
    token: props.token
  }
}

componentDidMount() {
    // get attendance initial data to be passed to search
    this.getUsers()
  }
  
  getUsers() {
    axios({
      method: 'get',
      url: 'users',
      headers: { 'x-access-token': this.state.token }
    }).then((response) => {
      let userOptions = []
      console.log(response)
      for (let [index, userData] of response.data.users.entries()) {
      userOptions[index] = {
        key: userData.profile.name,
        text: userData.profile.name,
        value: userData._id
      }
    }
    this.setState({userOptions, isLoading: false})
    }).catch((error) => {
      console.log(error)
    })
  }
  
  formatUserAttendance = (rawUserData) => {
    console.log(rawUserData)
    let attendances = []
    let user = {}
    for (let [index, attendanceData] of rawUserData.userAttendance.entries()) {
      attendances[index] = {
        className: attendanceData.className,
        date: moment(attendanceData.date).format('DD/MM/YYYY'),
        type: attendanceData.classType,
        hours: attendanceData.duration,
        classId: attendanceData.classId,
        status: attendanceData.status
      }
    }
    user = {
      total: rawUserData.total,
      attended: rawUserData.attended,
      totalHours: rawUserData.totalHours,
      percentage: rawUserData.percentage,
      attendances: attendances
    }
    return user
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    let { startDate, endDate, classSelector, userSelector } = this.state
    startDate = moment(startDate).format('[/]YYYYMMDD')
    endDate = moment(endDate).format('[-]YYYYMMDD')
    axios({
      method: 'get',
      url: 'attendance/user/' + userSelector + startDate + endDate + '/' + classSelector,
      headers: { 'x-access-token': this.state.token }
    }).then((response) => {
      if (response.data.attendances.length > 0) this.setState({attendanceFormattedData: this.formatUserAttendance(response.data.attendances[0]), isLoading: false})
      else this.setState({isLoading: false})
    }).catch((error) => {
      console.log(error)
    })
}
  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  handleSearchOptions = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  render () {
    const { moreOptions, classSelector, userSelector, isLoading, userOptions, attendanceFormattedData } = this.state
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
                        required
                        selected={this.state.startDate}
                        selectsStart
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={(date) => this.handleDateChange('startDate', date)}
                        placeholderText='Click to select' />
                    </Form.Field>
                    <Form.Field style={datePickingStyle}>
                      <label>Ending Date</label>
                      <DatePicker
                        required
                        selected={this.state.endDate}
                        selectsEnd
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={(date) => this.handleDateChange('endDate', date)}
                        placeholderText='Click to select' />
                    </Form.Field>
                    <Form.Button positive widths='10'>Go</Form.Button>
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
           
              <Dimmer active={isLoading} inverted>
               <Loader indeterminate active={isLoading}>Loading Data</Loader>
              </Dimmer>
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
            <Table.HeaderCell>Name</Table.HeaderCell>
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
            <Table.Cell collapsing>{data.classType}</Table.Cell>
            <Table.Cell collapsing>{data.hours}</Table.Cell>
            <Table.Cell collapsing>{data.status == 1 ? 'Present' : 'Absent'}</Table.Cell>
          </Table.Row>
        ))}
        </Table.Body>
      </Table>
      </div>
    )
  }
}

export default AttendanceUser
