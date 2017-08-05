import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Loader, Dimmer, Checkbox, Button } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { array, object } from 'prop-types'
import { Link } from 'react-router-dom'
import moment from 'moment'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

class AttendanceSearch extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  static contextTypes = {
    router: object.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      startDate: '',
      endDate: '',
      selected:[],
      moreOptions: false,
      classSelector: '',
      isLoading: true,
      token: props.token,
      attendances:[]
    }
  }

  componentDidMount() {
    // get attendance initial data to be passed to search
    this.getInitialAttendance()
  }

  getInitialAttendance () {
    axios({
      method: 'get',
      url: '/attendance/class/dateStart/dateEnd',
      headers: { 'x-access-token': this.state.token }
    }).then((response) => {
      this.setState({attendances: this.formatAttendances(response.data.foundAttendances), isLoading: false})
    }).catch((error) => {
      console.log(error)
    })
  }

  handleCheckBox = (e, { name: _id, checked }) => {
    let { selected } = this.state
    if (checked) {
      selected.push(_id)
    } else {
      selected = selected.filter((element) => element !== _id)
    }
    this.setState({selected})
  }

  handleEdit = e => {
    e.preventDefault()
    const { selected } = this.state
    if (selected.length === 1) {
      const toEditId = selected[0]
      this.context.router.history.push(`/attendance/view/${toEditId}`)
    }
  }

  formatAttendances = (rawAttendanceData) => {
    let attendances = []
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
  
  handleSubmit = e => {
    e.preventDefault()
    let { startDate, endDate, classSelector } = this.state
    this.setState({ isLoading: true, selected:[] }) // reset selected when filtered
    if (startDate != '') startDate = moment(startDate).format('[/]YYYYMMDD')
    if (endDate != '') endDate = moment(endDate).format('[/]YYYYMMDD')
    if (classSelector.length > 0) classSelector = '/' + classSelector
    axios({
        method: 'get',
        url: '/attendance/class' + classSelector + '/dateStart' + startDate + '/dateEnd' + endDate,
        headers: { 'x-access-token': this.state.token },
      }).then(response => {
        let attendances = this.formatAttendances(response.data.foundAttendances)
        this.setState({ isLoading: false, attendances })
      }) 
  }
  
  getAttendance = (e, { value }) => this.setState({classSelector: value})
  
  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})
  
  clear = e => {
    e.preventDefault()
    this.setState({startDate: '', endDate: '', classSelector: ''})
  }
  
  render () {
    const { moreOptions, classSelector, attendances, isLoading, selected } = this.state
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
                    <Form.Button positive onClick={this.handleSubmit}>Go</Form.Button>
                    <Form.Button color='blue' onClick={this.handleEdit} disabled={selected.length !== 1}> Edit </Form.Button>
                    <Form.Button negative onClick={this.clear}>Clear</Form.Button>
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
                <Checkbox name={options._id} onChange={this.handleCheckBox} checked={selected.includes(options._id)} />
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
