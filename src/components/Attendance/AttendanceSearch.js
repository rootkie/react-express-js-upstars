import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Loader, Dimmer } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { array } from 'prop-types'
import moment from 'moment'
import axios from 'axios'
import { Link } from 'react-router-dom'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

class AttendanceSearch extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      startDate: '',
      endDate: '',
      moreOptions: false,
      classSelector: '',
      isLoading: true,
      attendances: []
    }
  }

  componentDidMount () {
    // get attendance initial data to be passed to search
    this.getInitialAttendance()
  }

  // Get the data and populate the state so that the front-end can display.
  getInitialAttendance () {
    axios.get('/attendance/class/dateStart/dateEnd')
      .then(response => {
        this.setState({attendances: this.formatAttendances(response.data.foundAttendances), isLoading: false})
      }).catch(error => {
        console.log(error)
      })
  }

  formatAttendances = (rawAttendanceData) => {
    let attendances = []
    // Refactor the information for easier display.
    for (let [index, attendanceData] of rawAttendanceData.entries()) {
      attendances[index] = {
        _id: attendanceData._id,
        className: attendanceData.class.className,
        date: moment(attendanceData.date).format('DD/MM/YYYY'),
        type: attendanceData.type,
        hours: attendanceData.hours
      }
    }
    return attendances
  }

  handleSearch = e => {
    e.preventDefault()
    let { startDate, endDate, classSelector } = this.state
    this.setState({ isLoading: true }) // reset selected when filtered

    // Special formating to fit the API Call. Explained below: /attendance/class/:classId?/dateStart/:dateStart?/dateEnd/:dateEnd?
    // Case 1: startDate is not given, optional field ':dateStart?' will be empty and backend ignores this search requirement
    // Case 2: endDate is not given, similarly, endDate is optional
    // Case 3: class is not given. '?' in the API means the field is optional.
    // So an API like '/attendance/class/dateStart/dateEnd/' will simply return every single attendance records of every class.
    if (startDate !== '') startDate = moment(startDate).format('[/]YYYYMMDD') //  From the moments docs, [] allows additional characters
    if (endDate !== '') endDate = moment(endDate).format('[/]YYYYMMDD')
    if (classSelector.length > 0) classSelector = '/' + classSelector

    // Get new data based on the search filters and populate attendance
    axios.get('/attendance/class' + classSelector + '/dateStart' + startDate + '/dateEnd' + endDate)
      .then(response => {
        let attendances = this.formatAttendances(response.data.foundAttendances)
        this.setState({ isLoading: false, attendances })
      })
  }

  // Used to add a class as an additional filter
  getAttendance = (e, { value }) => this.setState({classSelector: value})

  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  clear = e => {
    e.preventDefault()
    this.setState({startDate: '', endDate: '', classSelector: ''})
  }

  render () {
    const { moreOptions, classSelector, attendances, isLoading } = this.state
    const { classData } = this.props

    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='6'>
              <Form>
                <div id='volunteer-date-wrapper' style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Form.Group inline style={{marginBottom: 0}}>
                    <Form.Field style={datePickingStyle}>
                      <label>Starting Date</label>
                      <DatePicker
                        dateFormat='DD/MM/YYYY'
                        selected={this.state.startDate}
                        maxDate={this.state.endDate}
                        onChange={(date) => this.handleDateChange('startDate', date)}
                        placeholderText='Click to select' />
                    </Form.Field>
                    <Form.Field style={datePickingStyle}>
                      <label>Ending Date</label>
                      <DatePicker
                        dateFormat='DD/MM/YYYY'
                        selected={this.state.endDate}
                        minDate={this.state.startDate}
                        onChange={(date) => this.handleDateChange('endDate', date)}
                        placeholderText='Click to select' />
                    </Form.Field>
                    <Form.Button positive onClick={this.handleSearch}>Search attendance records</Form.Button>
                    <Form.Button negative onClick={this.clear}>Clear all fields</Form.Button>
                  </Form.Group>
                  <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                </div>
                {moreOptions && <div>
                  <Form.Field style={{paddingTop: '10px'}}>
                    <label>Classes</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters={0} options={classData} onChange={this.getAttendance} />
                  </Form.Field>
                </div>}
              </Form>
              <Dimmer active={isLoading} inverted>
                <Loader indeterminate active={isLoading}>Loading Data</Loader>
              </Dimmer>
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

        <Table.Body>
          {attendances.map((options, i) => (
            <Table.Row key={`attendance-${i}`}>
              <Table.Cell collapsing>{i + 1}</Table.Cell>
              <Table.Cell><Link to={'/attendance/view/' + options._id}>{options.className}</Link></Table.Cell>
              <Table.Cell>{options.date}</Table.Cell>
              <Table.Cell>{options.type}</Table.Cell>
              <Table.Cell>{options.hours}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
      </Table>
    )
  }
}

export default AttendanceSearch
