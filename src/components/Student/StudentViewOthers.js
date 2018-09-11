import React, { Component } from 'react'
import { array, func, bool } from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Table, Icon, Form, Dropdown, Dimmer, Loader, Grid, Search } from 'semantic-ui-react'
import axios from 'axios'

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
    value: '',
    results: [],
    id: '',
    redirect: false,
    moreOptions: false,
    isLoadingSearch: false,
    statusSelector: [],
    genderSelector: []
  }

  resetComponent = () => this.setState({ isLoadingSearch: false, results: [] })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoadingSearch: true, value })
    if (value.length < 1) return this.resetComponent()
    axios.get(`otherStudentsResponsive/${value}`)
      .then(response => {
        console.log(response)
        let studentList = response.data.studentsFiltered.map(student => {
          return {
            title: student.profile.name,
            id: student._id,
            key: student._id
          }
        })
        this.setState({ isLoadingSearch: false, results: studentList })
      })
  }

  handleResultSelect = (e, { result }) => {
    this.setState({redirect: true, id: result.id})
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  handleFilter = (e) => {
    e.preventDefault()
    const { searchFilter } = this.props
    const { statusSelector, genderSelector } = this.state
    const options = []
    statusSelector.length > 0 && options.push({field: 'status', value: statusSelector})
    genderSelector.length > 0 && options.push({field: 'profile-gender', value: genderSelector})
    searchFilter(options)
  }

  clearAll = e => {
    e.preventDefault()
    this.setState({ genderSelector: [], statusSelector: [] })
  }

  render () {
    const { moreOptions, genderSelector, statusSelector, value, results, id, redirect, isLoadingSearch } = this.state
    const { studentData, isLoading } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else if (redirect && id.length !== 0) {
      return <Redirect push to={`/dashboard/students/edit/${id}`} />
    } else {
      return (
        <Grid stackable stretched>
          <Grid.Row>
            <Grid.Column>
              <Table compact celled unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan='5'>
                      <Form>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Form.Group inline style={{marginBottom: 0}}>
                            <Search
                              loading={isLoadingSearch}
                              onResultSelect={this.handleResultSelect}
                              onSearchChange={this.handleSearchChange}
                              results={results}
                              value={value}
                            />
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
                          <Form.Group>
                            <Form.Button onClick={this.handleFilter}>Filter results</Form.Button>
                            <Form.Button color='red' onClick={this.clearAll}>Clear all</Form.Button>
                          </Form.Group>
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
                {studentData.length !== 0 &&
                <Table.Body>
                  {studentData.map((student, i) => (
                    <Table.Row key={`student-${i}`}>
                      <Table.Cell><Link to={`/dashboard/students/edit/${student._id}`}>{student.profile.name}</Link></Table.Cell>
                      <Table.Cell>{student.profile.gender === 'F' ? 'Female' : 'Male'}</Table.Cell>
                      <Table.Cell>{student.status}</Table.Cell>
                    </Table.Row>))}
                </Table.Body>
                }
                {studentData.length === 0 &&
                <Table.Body>
                  <Table.Row key={`empty-otherstudent`}>
                    <Table.Cell>Oops! No Student found in these criteria!</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                  </Table.Row>
                </Table.Body>
                }
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
  }
}

export default StudentViewOthers
