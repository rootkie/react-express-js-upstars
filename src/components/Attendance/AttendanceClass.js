import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header, Pagination } from 'semantic-ui-react'
import { array } from 'prop-types'
import moment from 'moment'
import axios from 'axios'

class AttendanceClass extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      classSelector: '',
      fullClassSummary: {
        'studentNumber': 0,
        'tutorNumber': 0,
        'studentTutorRatio': 0
      },
      totalPages: 1,
      activePage: 1,
      studentAttendance: [],
      tutorAttendance: []
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    axios.get(`/attendance/${this.state.classSelector}/summary`)
      .then(response => {
        let pagesRequired = Math.ceil(response.data.attendanceDates.length / 8)
        let fullClassSummary = this.dataParsing(response.data)
        this.setState({fullClassSummary, totalPages: pagesRequired})
      })
  }

  dataParsing = (attendanceData) => {
    let fullClassSummary = attendanceData
    console.log(attendanceData)
    const indexOfLast = this.state.activePage * 8
    const indexOfFirst = indexOfLast - 8
    fullClassSummary.compiledUserAttendance = fullClassSummary.compiledUserAttendance.map((user, index) => {
      return {
        details: user.details.slice(indexOfFirst, indexOfLast)
      }
    })
    console.log(fullClassSummary)
    return fullClassSummary
  }
  handlePaginationChange = (e, { activePage }) => this.setState({ activePage })

  // Real-time API call to search for the data.
  handleSearchOptions = (e, { name, value }) => {
    this.setState({[name]: value})
  }

  render () {
    const { classSelector, fullClassSummary, totalPages } = this.state
    const { classData } = this.props

    return (
      <div>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Field required>
                    <label>Class</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Select a class to view the report' search fluid selection minCharacters={0} options={classData} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  <Form.Button positive fluid disabled={!classSelector}>Retrieve class attendance summary</Form.Button>
                </Form>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>
        <Header>
          <Icon name='bar chart' />
          <Header.Content>
            Basic class statistics
          </Header.Content></Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student No.</Table.HeaderCell>
              <Table.HeaderCell>Tutor No.</Table.HeaderCell>
              <Table.HeaderCell>Student - Tutor Ratio</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell collapsing>{fullClassSummary.studentNumber}</Table.Cell>
              <Table.Cell collapsing>{fullClassSummary.tutorNumber}</Table.Cell>
              <Table.Cell collapsing>{fullClassSummary.studentTutorRatio}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header>
          <Icon name='line graph' />
          <Header.Content>
            Full Attendance Records
          </Header.Content>
        </Header>
        <Table celled striped columns={9}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Tutor Name</Table.HeaderCell>
              {fullClassSummary.status === 'success' && fullClassSummary.attendanceDates.map((date, index) => (
                <Table.HeaderCell>{moment(date.date).format('L')}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fullClassSummary.status === 'success' && fullClassSummary.compiledUserAttendance.map((attendance, index) => (
              <Table.Row key={`attendance-${index}`}>
                <Table.Cell>{attendance.userName[0]}</Table.Cell>
                {attendance.details.map((individualStatus, index) => (
                  <Table.Cell>{individualStatus}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='9'>
                <Pagination defaultActivePage={1} totalPages={totalPages} floated='right' onPageChange={this.handlePaginationChange} />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    )
  }
}

export default AttendanceClass
