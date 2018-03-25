import React, { Component } from 'react'
import { Table, Form, Dropdown, Icon, Header } from 'semantic-ui-react'
import { array } from 'prop-types'
import moment from 'moment'
import axios from 'axios'

const classOptions = [
  { key: 'python420', text: 'Python 420pm', value: 'py420' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'englishP5', text: 'English Primary 5', value: 'elp5' }
]

class AttendanceClass extends Component {
  static propTypes = {
    classData: array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      startDate: '',
      endDate: '',
      moreOptions: false,
      classSelector: ''
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
  }

  // Real-time API call to search for the data.
  handleSearchOptions = (e, { name, value }) => {
    this.setState({[name]: value})

  }

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  render () {
    const { classSelector } = this.state
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
                    <Dropdown name='classSelector' value={classSelector} placeholder='Select a class to view the report' search fluid selection minCharacters='0' options={classOptions} onChange={this.handleSearchOptions} />
                  </Form.Field>
                  <Form.Button positive fluid>Retrieve class attendance summary</Form.Button>
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
              <Table.Cell collapsing>
              John Doe
              </Table.Cell>
              <Table.Cell collapsing>2 Feb 2016</Table.Cell>
              <Table.Cell collapsing>69/100</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    )
  }
}

export default AttendanceClass
