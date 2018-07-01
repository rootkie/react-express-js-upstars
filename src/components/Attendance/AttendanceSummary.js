import React, { Component } from 'react'
import { Table, Header, Icon, Dimmer, Loader } from 'semantic-ui-react'
import axios from 'axios'
import { Link } from 'react-router-dom'

class AttendanceSummary extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      summaryData: []
    }
    axios.get('attendance/summary/all')
      .then(response => {
        this.setState({ summaryData: response.data.editedActiveClass, isLoading: false })
      })
  }

  render () {
    const { isLoading, summaryData } = this.state

    return (
      <div>
        <Dimmer active={isLoading} inverted>
          <Loader indeterminate active={isLoading}>Loading Data</Loader>
        </Dimmer>
        <Header as='h2'>
          <Icon name='bar chart' />
          <Header.Content>
            Summary of all classes
          </Header.Content>
        </Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Class Name</Table.HeaderCell>
              <Table.HeaderCell>Student No.</Table.HeaderCell>
              <Table.HeaderCell>Student / %</Table.HeaderCell>
              <Table.HeaderCell>User No.</Table.HeaderCell>
              <Table.HeaderCell>User / %</Table.HeaderCell>
              <Table.HeaderCell>Student-Tutor Ratio</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {summaryData.map((options, index) => (
              <Table.Row key={`class-${index}`}>
                <Table.Cell collapsing><Link to={'/dashboard/classes/id/' + options.id}>{options.className}</Link></Table.Cell>
                <Table.Cell collapsing>{options.studentNumber}</Table.Cell>
                <Table.Cell collapsing>{options.studentsPercentage * 100}%</Table.Cell>
                <Table.Cell collapsing>{options.userNumber}</Table.Cell>
                <Table.Cell collapsing>{options.usersPercentage * 100}%</Table.Cell>
                <Table.Cell collapsing>{options.STRatio}</Table.Cell>
              </Table.Row>))}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default AttendanceSummary
