import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

const classOptions = [
  { key: 'python420', text: 'Python 420pm', value: 'py420' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'englishP5', text: 'English Primary 5', value: 'elp5' }
]

class AttendanceView extends Component {
  state = {
    startDate: '',
    endDate: '',
    moreOptions: false,
    classSelector: '',
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { startDate, endDate } = this.state

    console.log(`getting data from ${moment(startDate).format('DDMMYYYY')} to ${moment(endDate).format('DDMMYYYY')}`)
  }

  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  handleSearchOptions = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  render () {
    const { moreOptions, classSelector } = this.state

    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='6'>
              <Form onSubmit={this.handleSubmit}>
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
                    <Form.Button>Go</Form.Button>
                  </Form.Group>
                  <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                </div>
                {moreOptions && <div>
                  <Form.Field style={{paddingTop: '10px'}}>
                    <label>Classes</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search multiple selection options={classOptions} onChange={this.handleSearchOptions} />
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

        <Table.Body>
          <Table.Row>
          <Table.Cell collapsing>
              1
         </Table.Cell>
            <Table.Cell collapsing>
              Python 2
         </Table.Cell>
            <Table.Cell collapsing>2 Feb 2016</Table.Cell>
            <Table.Cell collapsing>Class</Table.Cell>
            <Table.Cell collapsing>2 hrs</Table.Cell>
          </Table.Row>
          <Table.Row>
          <Table.Cell collapsing>
              2
         </Table.Cell>
            <Table.Cell collapsing>
              Python 2
         </Table.Cell>
            <Table.Cell collapsing>2 Feb 2016</Table.Cell>
            <Table.Cell collapsing>PHoliday</Table.Cell>
            <Table.Cell collapsing>0 hrs</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default AttendanceView
