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

const volunteerOptions = [
  { key: 'a', text: 'Won YK', value: 'wonyk' },
  { key: 'b', text: 'John Doe', value: 'jd' },
  { key: 'c', text: 'Ciri', value: 'ciri' }
]

const studentOptions = [
  { key: 'ahboy', text: 'Ah Boy', value: 'ahboy' },
  { key: 'xiaoming', text: 'Xiao Ming', value: 'xiaoming' },
  { key: 'borhk', text: 'Borhk', value: 'borhk' }
]

class Attendance extends Component {
  state = {
    startDate: '',
    endDate: '',
    moreOptions: false,
    classSelector: [],
    volunteerSelector: [],
    studentSelector: []
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
    const { moreOptions, classSelector, volunteerSelector, studentSelector } = this.state

    return (
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
                    <Dropdown name='classSelector' value={classSelector} placeholder='Pick Students' search multiple selection options={classOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  <Form.Field>
                    <label>Volunteers</label>
                    <Dropdown name='volunteerSelector' value={volunteerSelector} placeholder='Pick Volunteers' search multiple selection options={volunteerOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  <Form.Field>
                    <label>Students</label>
                    <Dropdown name='studentSelector' value={studentSelector} placeholder='Pick Students' search multiple selection options={studentOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                </div>}

              </Form>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Start Date</Table.HeaderCell>
            <Table.HeaderCell>Attendance Count</Table.HeaderCell>
            <Table.HeaderCell>Attendance Rate</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell collapsing>
              John Doe
         </Table.Cell>
            <Table.Cell collapsing>2 Feb 2016</Table.Cell>
            <Table.Cell collapsing textAlign='right'>69/100</Table.Cell>
            <Table.Cell collapsing textAlign='right'>69%</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell collapsing>
              John Doe
         </Table.Cell>
            <Table.Cell collapsing>2 Feb 2016</Table.Cell>
            <Table.Cell collapsing textAlign='right'>69/100</Table.Cell>
            <Table.Cell collapsing textAlign='right'>69%</Table.Cell>
          </Table.Row>
          <Table.Row negative>
            <Table.Cell collapsing>
              Ruide
         </Table.Cell>
            <Table.Cell collapsing>4 Feb 2016</Table.Cell>
            <Table.Cell collapsing textAlign='right'>23/100</Table.Cell>
            <Table.Cell collapsing textAlign='right'>23%</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

export default Attendance
