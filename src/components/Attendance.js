import React, { Component } from 'react'
import { Table, Form } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

class Attendance extends Component {
  state = {
    startDate: '',
    endDate: ''
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { startDate, endDate } = this.state

    console.log(`getting data from ${moment(startDate).format('DDMMYYYY')} to ${moment(endDate).format('DDMMYYYY')}`)
  }

  handleDateChange = (dateType, date) => this.setState({[dateType]: date})

  render () {
    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group inline>
                  <Form.Field style={datePickingStyle}>
                    <label>Starting Date</label>
                    <DatePicker
                      selected={this.state.startDate}
                      selectsStart
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      onChange={(date) => this.handleDateChange('startDate', date)}
                      placeholderText='Click to select'

                    />
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
