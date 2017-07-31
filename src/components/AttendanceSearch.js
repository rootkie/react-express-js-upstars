import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Message, Loader, Dimmer } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { array } from 'prop-types'
import moment from 'moment'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

let attendances = [{'className': 'Press GO to search for attendances'}]

class AttendanceSearch extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  
  state = {
    startDate: '',
    endDate: '',
    moreOptions: false,
    classSelector: '',
    isLoading: false,
    attendances
  }

  handleSubmit = e => {
    e.preventDefault()
    let { startDate, endDate, classSelector } = this.state
    this.setState({ isLoading: true })
    if (startDate != '') startDate = moment(startDate).format('[/]YYYYMMDD')
    if (endDate != '') endDate = moment(endDate).format('[/]YYYYMMDD')
    if (classSelector.length > 0) classSelector = '/' + classSelector
    axios({
      method: 'get',
        url: '/attendance/class' + classSelector + '/dateStart' + startDate + '/dateEnd' + endDate,
        headers: {'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdkOWYyOTQ3Nzg0YTRlYzRlODY3NDkiLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInN0YXR1cyI6IlBlbmRpbmciLCJjbGFzc2VzIjpbXSwiaWF0IjoxNTAxNDA0OTY5LCJleHAiOjE1MDE3NjQ5Njl9.v-94Gcu5u6JTgu0Ij-VU2GJ1Ht6ORb1gBYNOZFmhzow'},
      }).then(response => {
        let attendances = []
        for (let [index, attendanceData] of response.data.foundAttendances.entries()) {
          attendances[index] = {
            value: attendanceData._id,
            className: attendanceData.class.className,
            date: moment(attendanceData.date).format('DD/MM/YYYY'),
            type: attendanceData.type,
            hours: attendanceData.hours
          }
        }
        this.setState({ isLoading: false, attendances: attendances })
      }) 
  }
  
  getAttendance = (e, { value }) => this.setState({'classSelector': value})
  
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
                        selected={this.state.endDate}
                        selectsEnd
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={(date) => this.handleDateChange('endDate', date)}
                        placeholderText='Click to select' />
                    </Form.Field>
                    <Form.Button onClick={this.handleSubmit}>Go</Form.Button>
                    <Form.Button negative onClick={this.clear}>Clear Selection</Form.Button>
                  </Form.Group>
                  <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                </div>
                {moreOptions && <div>
                  <Form.Field style={{paddingTop: '10px'}}>
                    <label>Classes</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters='0' options={classData} onChange={this.getAttendance} />
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
              <Table.Cell collapsing>
                {i}
              </Table.Cell>
              <Table.Cell>{options.className}</Table.Cell>
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
