import React from 'react'
import { Table, Form, Dropdown, Icon, Header, Message, Grid, Search } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import axios from 'axios'

const datePickingStyle = {
  display: 'flex',
  alignItems: 'center'
}

const StudentUserForm = ({state, dispatch, classData, userType, handleSubmit}) => {
  const resetComponent = () => {
    dispatch({type: 'resetSearchBar'})
  }

  const handleSearchChange = async (e, { value }) => {
    dispatch({type: 'startSearch', value})
    if (value.length < 1) return resetComponent()
    const uri = userType === 'student' ? 'studentsResponsive' : 'usersResponsive'
    const response = await axios.get(`${uri}/${value}`)
    const rawResponse = userType === 'student' ? response.data.studentsFiltered : response.data.users
    const resultsList = rawResponse.map(user => {
      return {
        title: user.name,
        id: user._id,
        key: user._id
      }
    })
    dispatch({type: 'endSearch', results: resultsList})
  }

  const handleResultSelect = (e, { result }) => {
    dispatch({type: 'updateField', name: 'value', value: result.title})
    if (userType === 'student') {
      return dispatch({type: 'updateField', name: 'studentSelector', value: result.id})
    }
    dispatch({type: 'updateField', name: 'userSelector', value: result.id})
  }
  const handleClassSearchOptions = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value})
  }

  const toggleOptions = () => {
    dispatch({type: 'updateField', name: 'moreOptions', value: !state.moreOptions})
  }

  const { startDate, endDate, moreOptions, classSelector, value, results, isLoadingSearch, attendanceFormattedData, error } = state
  return (
    <React.Fragment>
      <Grid.Row>
        <Grid.Column>
          <Table celled striped unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='4'>
                  <Form onSubmit={handleSubmit}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <Form.Group inline style={{marginBottom: 0}}>
                        <Form.Field style={datePickingStyle}>
                          <label>Starting Date</label>
                          <DatePicker
                            dateFormat='DD/MM/YYYY'
                            required
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode='select'
                            selected={startDate}
                            maxDate={endDate}
                            onChange={(date) => dispatch({type: 'updateField', name: 'startDate', value: date})}
                            placeholderText='Click to select' />
                        </Form.Field>
                        <Form.Field style={datePickingStyle}>
                          <label>Ending Date</label>
                          <DatePicker
                            dateFormat='DD/MM/YYYY'
                            required
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode='select'
                            selected={endDate}
                            minDate={startDate}
                            onChange={(date) => dispatch({type: 'updateField', name: 'endDate', value: date})}
                            placeholderText='Click to select' />
                        </Form.Field>
                        <Form.Button positive>Search {userType === 'student' ? 'student\'s' : 'user\'s' } attendance records</Form.Button>
                      </Form.Group>
                      <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={toggleOptions} />
                    </div>
                    <Form.Field required>
                      <label>{userType === 'student' ? 'Students' : 'Users' }</label>
                      <Search
                        loading={isLoadingSearch}
                        onResultSelect={handleResultSelect}
                        onSearchChange={handleSearchChange}
                        results={results}
                        value={value}
                      />
                    </Form.Field>
                    {moreOptions && <div>
                      <Form.Field style={{paddingTop: '5px'}}>
                        <label>Classes</label>
                        <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search selection minCharacters={0} options={classData} onChange={handleClassSearchOptions} clearable />
                      </Form.Field>
                    </div>}

                  </Form>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
        </Grid.Column>
      </Grid.Row>
      {error.length !== 0 &&
      <Grid.Row>
        <Grid.Column>
          <Message
            // hidden={error.length === 0}
            icon='exclamation triangle'
            header='Error!'
            negative
            content={error}
          />
        </Grid.Column>
      </Grid.Row>
      }
      <Grid.Row>
        <Grid.Column>
          <Header as='h3' dividing>{ userType === 'student' ? 'Student Statistics' : 'User Statistics'}</Header>
          <Table compact celled unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Attendance Found</Table.HeaderCell>
                <Table.HeaderCell>Attended</Table.HeaderCell>
                <Table.HeaderCell>Total Hours</Table.HeaderCell>
                <Table.HeaderCell>Percentage</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>{attendanceFormattedData.total}</Table.Cell>
                <Table.Cell>{attendanceFormattedData.attended}</Table.Cell>
                <Table.Cell>{attendanceFormattedData.totalHours}</Table.Cell>
                <Table.Cell>{parseFloat(attendanceFormattedData.percentage * 100).toFixed(2)}%</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Header as='h3' dividing>{ userType === 'student' ? 'Student Attendance' : 'User Attendance' }</Header>
          <Table celled striped unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Class Name</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Hours</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {attendanceFormattedData.attendances.map((data) => (
                <Table.Row key={data.className + data.date}>
                  <Table.Cell collapsing>{data.className}</Table.Cell>
                  <Table.Cell collapsing>{data.date}</Table.Cell>
                  <Table.Cell collapsing>{data.type}</Table.Cell>
                  <Table.Cell collapsing>{data.hours}</Table.Cell>
                  <Table.Cell collapsing>{data.status === 1 ? 'Present' : 'Absent'}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </React.Fragment>
  )
}

StudentUserForm.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  classData: PropTypes.array.isRequired,
  userType: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired
}

export default StudentUserForm
