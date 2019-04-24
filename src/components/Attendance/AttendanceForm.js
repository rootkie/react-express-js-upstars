import React, { useReducer } from 'react'
import { Form, Message, Header, Table, Checkbox, Loader, Dimmer, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import { object, string, date, number } from 'yup'
import axios from 'axios'
import moment from 'moment'

// Note: classSelection is a bool that tracks if any class is provided by the user.
const initialState = {
  attendanceDate: undefined,
  className: '',
  type: 'Class',
  hours: '',
  students: [{'text': 'Select class to view sudents', 'key': '0'}],
  users: [{'text': 'Select class to view users', 'key': '1'}],
  isLoading: false,
  classSelection: false,
  error: ''
}

const typeOptions = [
  { key: 'Class', text: 'Class', value: 'Class' },
  { key: 'PHoliday', text: 'Public Holiday', value: 'PHoliday' },
  { key: 'Cancelled', text: 'Cancelled', value: 'Cancelled' }
]

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'retrieveData':
      return {
        ...initialState,
        className: action.value,
        isLoading: true,
        error: ''
      }
    case 'initData':
      return {
        ...state,
        users: action.userList,
        students: action.studentList,
        classSelection: true
      }
    case 'changeType':
      return {
        ...state,
        students: action.students,
        users: action.users
      }
    case 'emptyClass':
      return {
        ...state,
        classSelection: false,
        error: 'Attendance can only be created if the class is not empty. Please add some students or users.'
      }
    default:
      return state
  }
}

const AttendanceForm = ({classData, history}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleCheckboxChangeForUser = (e, { name: id, checked }) => {
    let users = [...state.users]
    const pos = users.map(usr => usr.key).indexOf(id)
    users[pos].status = checked ? 1 : 0
    dispatch({type: 'updateField', name: 'users', value: users})
  }

  const handleCheckboxChangeForStudent = (e, { name: id, checked }) => {
    let students = [...state.students]
    const pos = students.map(std => std.key).indexOf(id)
    students[pos].status = checked ? 1 : 0
    dispatch({type: 'updateField', name: 'students', value: students})
  }

  const handleChange = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value})
  }

  const handleClass = (e, { value }) => {
    dispatch({type: 'retrieveData', value})
    axios.get('/class/' + value)
      .then(response => {
        const { students, users } = response.data.class
        let userList = []
        let studentList = []
        for (const [index, studentData] of students.entries()) {
          studentList[index] = {
            text: studentData.name,
            student: studentData._id,
            key: studentData._id,
            status: 1
          }
        }

        for (const [index, userData] of users.entries()) {
          userList[index] = {
            text: userData.name,
            user: userData._id,
            key: userData._id,
            status: 1
          }
        }
        dispatch({type: 'initData', userList, studentList})
        if (userList.length === 0 && studentList.length === 0) {
          dispatch({type: 'emptyClass'})
        }
      })
      .finally(() => {
        dispatch({type: 'updateField', name: 'isLoading', value: false})
      })
  }

  const handleChangeType = (e, { value }) => {
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

  const handleSubmit = e => {
    e.preventDefault()
    const { attendanceDate, className, type, students, users, hours } = state
    const requiredFields = object({
      className: string().required('Please provide a valid class name'),
      type: string().required('Was this lesson held? Or was it cancelled?'),
      hours: number().min(0, 'The minimum hour is zero (0)').required('Please provide the number of hours'),
      attendanceDate: date().required('Please provide a valid date')
    })
    requiredFields.validate({
      attendanceDate, className, type, hours
    }).then(async valid => {
      try {
        const response = await axios.post('/attendance',
          {
            date: attendanceDate,
            classId: className,
            users,
            students,
            hours,
            type
          })
        history.push(`/dashboard/attendance/view/${response.data.attendanceId}`)
      } catch (err) {
        dispatch({type: 'updateField', name: 'error', value: err.response.data.error})
      }
    }).catch(err => {
      if (err.name === 'ValidationError') {
        console.log(err.errors)
        dispatch({type: 'updateField', name: 'error', value: err.errors})
      }
    })
  }

  const { attendanceDate, type, className, students, users, error, hours, classSelection, isLoading } = state
  if (isLoading) {
    return (
      <Dimmer active={isLoading} inverted>
        <Loader indeterminate active={isLoading}>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <Form onSubmit={handleSubmit}>
            <Form.Group widths='equal'>
              <Form.Select label='Class' placeholder='Name of class' name='className' options={classData} search selection minCharacters={0} value={className} onChange={handleClass} required />
              <Form.Select label='Type' placeholder='Type' name='type' options={typeOptions} value={type} onChange={handleChangeType} disabled={!classSelection} required />
              <Form.Input label='Hours' placeholder='enter hours here' type='number' name='hours' value={hours} onChange={handleChange} disabled={type !== 'Class' || !classSelection} required={type === 'Class'} />
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
                  onChange={date => { dispatch({type: 'updateField', name: 'attendanceDate', value: date}) }}
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
                      <Checkbox name={options.key} onChange={handleCheckboxChangeForStudent} checked={options.status === 1} disabled={type !== 'Class'} />
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
                      <Checkbox name={options.key} onChange={handleCheckboxChangeForUser} checked={options.status === 1} disabled={type !== 'Class'} />
                    </Table.Cell>
                    <Table.Cell>{options.text}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
            </Table>

            <Form.Button disabled={!classSelection} icon='plus' labelPosition='left' content='submit' />
          </Form>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Message
            hidden={error.length === 0}
            icon='exclamation'
            header='Error!'
            negative
            content={error}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

AttendanceForm.propTypes = {
  history: PropTypes.object.isRequired,
  classData: PropTypes.array.isRequired
}

export default AttendanceForm
