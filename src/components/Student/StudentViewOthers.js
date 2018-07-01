import React, { Component } from 'react'
import { array, func, bool } from 'prop-types'
import { Link } from 'react-router-dom'
import { Table, Icon, Form, Dropdown, Dimmer, Loader } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'

const genderOptions = [
  { key: 'M', text: 'Male', value: 'M' },
  { key: 'F', text: 'Female', value: 'F' }
]

const statusOptions = [
  { key: 'Deleted', text: 'Deleted', value: 'Deleted' },
  { key: 'Suspended', text: 'Suspended', value: 'Suspended' },
  { key: 'Stopped', text: 'Stopped', value: 'Stopped' }
]

class StudentViewOthers extends Component {
  static propTypes = {
    studentData: array.isRequired,
    searchFilter: func.isRequired,
    isLoading: bool
  }

  state = {
    searchName: '',
    moreOptions: false,
    statusSelector: [],
    genderSelector: []
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  handleFilter = (e) => {
    e.preventDefault()
    const { searchFilter } = this.props
    const { searchName, statusSelector, genderSelector } = this.state
    const options = []
    searchName.length > 0 && options.push({field: 'profile-name', value: searchName})
    statusSelector.length > 0 && options.push({field: 'status', value: statusSelector})
    genderSelector.length > 0 && options.push({field: 'profile-gender', value: genderSelector})
    searchFilter(options)
  }

  clearAll = e => {
    e.preventDefault()
    this.setState({ genderSelector: [], statusSelector: [], searchName: '' })
  }

  render () {
    const { searchName, moreOptions, genderSelector, statusSelector } = this.state
    const { studentData, isLoading } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
      return (
        <Table compact celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='5'>
                <Form>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Form.Group inline style={{marginBottom: 0}}>
                      <Form.Input label='Search by name' placeholder='Leave it empty to view all' name='searchName' value={searchName} onChange={this.handleChange} />
                      <Form.Button onClick={this.handleFilter}>Filter results</Form.Button>
                      <Form.Button color='red' onClick={this.clearAll}>Clear all</Form.Button>
                    </Form.Group>
                    <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                  </div>
                  {moreOptions && <div>
                    <Form.Field style={{paddingTop: '10px'}}>
                      <label>Filter by Gender</label>
                      <Dropdown name='genderSelector' value={genderSelector} placeholder='Male or Female' multiple selection options={genderOptions} onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field>
                      <label>Filter by Status</label>
                      <Dropdown name='statusSelector' value={statusSelector} placeholder='Select status' search multiple selection options={statusOptions} onChange={this.handleChange} />
                    </Form.Field>
                  </div>}

                </Form>
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Gender</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {studentData.map((student, i) => (
              <Table.Row key={`student-${i}`}>
                <Table.Cell><Link to={`/dashboard/students/edit/${student._id}`}>{student.profile.name}</Link></Table.Cell>
                <Table.Cell>{student.profile.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
                <Table.Cell>{student.status}</Table.Cell>
              </Table.Row>))}
          </Table.Body>
        </Table>
      )
    }
  }
}

export default StudentViewOthers
