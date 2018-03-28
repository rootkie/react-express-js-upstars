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
      basicStats: {
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
        console.log(response)
        let pagesRequired = Math.ceil(response.data.attendanceDates.length / 8)
        let rawClassData = response.data
        const indexOfLast = this.state.activePage * 8
        const indexOfFirst = indexOfLast - 8
        let attendanceDates = rawClassData.attendanceDates.slice(indexOfFirst, indexOfLast)
        let basicStats = {
          studentNumber: rawClassData.studentNumber,
          tutorNumber: rawClassData.tutorNumber,
          studentTutorRatio: rawClassData.studentTutorRatio,
          status: rawClassData.status,
          attendanceDates
        }
        let studentAttendance = rawClassData.compiledStudentAttendance.map((user, index) => {
          return {
            details: user.details.slice(indexOfFirst, indexOfLast),
            attended: user.attended,
            percentage: user.percentage,
            studentName: user.studentName[0],
            studentID: user.studentID,
            total: user.total
          }
        })
        this.setState({basicStats, totalPages: pagesRequired, studentAttendance})
      })
  }

  handlePaginationChange = (e, { activePage }) => this.setState({ activePage })

  // Real-time API call to search for the data.
  handleSearchOptions = (e, { name, value }) => {
    this.setState({[name]: value})
  }

  render () {
    const { classSelector, basicStats, totalPages, studentAttendance } = this.state
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
              <Table.Cell collapsing>{basicStats.studentNumber}</Table.Cell>
              <Table.Cell collapsing>{basicStats.tutorNumber}</Table.Cell>
              <Table.Cell collapsing>{basicStats.studentTutorRatio}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <Header>
          <Icon name='line graph' />
          <Header.Content>
            Full Attendance Records
          </Header.Content>
        </Header>
        <Table celled striped columns={12}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Tutor Name</Table.HeaderCell>
              <Table.HeaderCell>Total Class</Table.HeaderCell>
              <Table.HeaderCell>No. attendeed</Table.HeaderCell>
              <Table.HeaderCell>Percentage</Table.HeaderCell>
              {basicStats.status === 'success' && basicStats.attendanceDates.map((date, index) => (
                <Table.HeaderCell>{moment(date.date).format('L')}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {basicStats.status === 'success' && studentAttendance.map((attendance, index) => (
              <Table.Row key={`attendance-${index}`}>
                <Table.Cell>{attendance.studentName}</Table.Cell>
                <Table.Cell>{attendance.total}</Table.Cell>
                <Table.Cell>{attendance.attended}</Table.Cell>
                <Table.Cell>{(attendance.percentage * 100).toFixed(2)}%</Table.Cell>
                {attendance.details.map((individualStatus, index) => (
                  <Table.Cell>{individualStatus}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='12'>
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
