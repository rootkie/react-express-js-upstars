import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header, Menu } from 'semantic-ui-react'
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
        'studentTutorRatio': 0,
        'attendanceDates': []
      }
    }
  }

  handleSubmit = (e) => {
    axios.get(`/attendance/${this.state.classSelector}/summary`)
      .then(response => {
        console.log(response)
        this.setState({fullClassSummary: response.data})
      })
    e.preventDefault()
  }

  // Real-time API call to search for the data.
  handleSearchOptions = (e, { name, value }) => {
    this.setState({[name]: value})
  }

  render () {
    const { classSelector, fullClassSummary } = this.state
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
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student Name</Table.HeaderCell>
              {fullClassSummary.attendanceDates.map((date, index) => (
                <Table.HeaderCell>{moment(date.date).format('L')}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='3'>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  <Menu.Item as='a'>1</Menu.Item>
                  <Menu.Item as='a'>2</Menu.Item>
                  <Menu.Item as='a'>3</Menu.Item>
                  <Menu.Item as='a'>4</Menu.Item>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    )
  }
}

export default AttendanceClass
