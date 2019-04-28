import React from 'react'
import { Form, Header, Table, Checkbox } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' }
]

const AddEditForm = ({state, dispatch, classData, newAttendance, handleClass, edit}) => {
  const handleCheckboxChangeForUser = (e, { name: id, checked }) => {
    let users = [...state.users]
    const pos = users.map(usr => usr.key).indexOf(id)
    users[pos].status = checked ? 1 : 0
    dispatch({type: 'updateField', name: 'users', value: users})
  }

  const handleCheckboxChangeForStudent = (e, { name: id, checked }) => {
    if (edit) {
      let students = [...state.students]
      const pos = students.map(std => std.key).indexOf(id)
      students[pos].status = checked ? 1 : 0
      dispatch({type: 'updateField', name: 'students', value: students})
    }
  }

  const handleChange = (e, { name, value }) => {
    if (edit) {
      dispatch({type: 'updateField', name, value})
    }
  }

  const handleChangeType = (e, { value }) => {
    if (edit) {
      dispatch({type: 'updateField', name: 'type', value})
      let students = [...state.students]
      let users = [...state.users]
      if (value === 'Class') {
        for (let a = 0; a < students.length; a++) {
          students[a]['status'] = 1
        }
        for (let b = 0; b < users.length; b++) {
          users[b]['status'] = 1
        }
      } else {
        for (let a = 0; a < students.length; a++) {
          students[a]['status'] = 0
        }
        for (let b = 0; b < users.length; b++) {
          users[b]['status'] = 0
        }
        dispatch({type: 'updateField', name: 'hours', value: 0})
      }
      dispatch({type: 'changeType', users, students})
    }
  }

  const { attendanceDate, type, className, students, users, hours, classSelection } = state
  return (
    <React.Fragment>
      <Form.Group widths='equal'>
        {newAttendance &&
        <React.Fragment>
          <Form.Select label='Class' placeholder='Name of class' name='className' options={classData} search selection minCharacters={0} value={className} onChange={handleClass} required />
          <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={handleChangeType} disabled={!classSelection} required />
          <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={handleChange} disabled={type !== 'Class' || !classSelection} required={type === 'Class'} />
        </React.Fragment>
        }
        {
          !newAttendance &&
          <React.Fragment>
            <Form.Input label='Class' placeholder='Name of class' name='className' value={className} readOnly required />
            <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={handleChangeType} required />
            <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={handleChange} disabled={type !== 'Class'} required={type === 'Class'} />
          </React.Fragment>
        }
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Field required>
          <label>Date of class</label>
          <DatePicker
            placeholderText='Click to select a date'
            dateFormat='DD/MM/YYYY'
            disabled={!classSelection}
            selected={attendanceDate}
            maxDate={moment()}
            onChange={date => { if (newAttendance) dispatch({type: 'updateField', name: 'attendanceDate', value: date}) }}
            readOnly={!newAttendance}
            required />
        </Form.Field>
      </Form.Group>
      <Header as='h3' dividing>Student Attendance</Header>
      <Table compact celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {students.length === 0 &&
          <Table.Row key={`student-notexist`}>
            <Table.Cell collapsing>
              <Checkbox checked={false} disabled />
            </Table.Cell>
            <Table.Cell>There are no students in this class.</Table.Cell>
          </Table.Row>}
          {students.length !== 0 && students.map((options, i) => (
            <Table.Row key={`student-${options.key}`}>
              <Table.Cell collapsing>
                <Checkbox name={options.key} onChange={handleCheckboxChangeForStudent} checked={options.status === 1} disabled={type !== 'Class' || edit === false} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
      </Table>

      <Header as='h3' dividing>User Attendance</Header>

      <Table compact celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.length === 0 &&
          <Table.Row key={`user-notexist`}>
            <Table.Cell collapsing>
              <Checkbox checked={false} disabled />
            </Table.Cell>
            <Table.Cell>There are no users in this class.</Table.Cell>
          </Table.Row>}
          {users.length !== 0 && users.map((options, i) => (
            <Table.Row key={`user-${options.key}`}>
              <Table.Cell collapsing>
                <Checkbox name={options.key} onChange={handleCheckboxChangeForUser} checked={options.status === 1} disabled={type !== 'Class' || edit === false} />
              </Table.Cell>
              <Table.Cell>{options.text}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
      </Table>
    </React.Fragment>
  )
}

AddEditForm.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  newAttendance: PropTypes.bool.isRequired,
  edit: PropTypes.bool.isRequired,
  classData: PropTypes.object,
  handleClass: PropTypes.func
}

export default AddEditForm
