import React, { useEffect, useReducer } from 'react'
import { Form, Message, Button, Header, List, Popup, Modal, Dimmer, Loader, Icon, Grid } from 'semantic-ui-react'
import AddEditForm from './shared/AddEditForm'
import PropTypes from 'prop-types'
import { object, string, number } from 'yup'
import axios from 'axios'
import moment from 'moment'

// Initially, edit state is false.
const initialState = {
  attendanceDate: undefined,
  className: '',
  classId: '',
  type: '',
  hours: '',
  edit: false,
  createdAt: undefined,
  updatedAt: undefined,
  __v: 0,
  classAuthorisedForEdit: [],
  isLoading: true,
  errorMessage: '',
  students: [{ text: 'Not found. Please try another search', key: '0' }],
  users: [{ text: 'Not found. Please try another search', key: '0' }],
  buttonName: 'Edit Attendance',
  deleteConfirm: false,
  submitSuccess: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'changeType':
      return {
        ...state,
        students: action.students,
        users: action.users
      }
    case 'initData':
      return {
        ...state,
        ...action.compiledAttendanceObject,
        isLoading: false
      }
    case 'setEdit':
      return {
        ...state,
        edit: true,
        buttonName: 'Save Edits'
      }
    case 'prepDelete':
      return {
        ...state,
        isLoading: true,
        deleteConfirm: false
      }
    case 'successEdit':
      return {
        ...state,
        edit: false,
        submitSuccess: true,
        buttonName: 'Edit Attendance',
        updatedAt: new Date(),
        __v: state.__v + 1
      }
    case 'resetState':
      return {
        ...initialState
      }
    case 'showError':
      return {
        ...state,
        isLoading: false,
        errorMessage: action.value
      }
    default:
      return state
  }
}

const AttendanceView = ({ match, classData, roles, history }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getAttendanceData()
  }, [match.params.attendanceId])

  /*
  ============
  FUNCTIONS
  ============
  */
  const getAttendanceData = async () => {
    const { attendanceId } = match.params
    dispatch({ type: 'resetState' })
    if (!/^[0-9a-fA-F]{24}$/.test(attendanceId)) {
      return history.replace('/dashboard/attendance/search')
    }
    const response = await axios.get('attendance/' + attendanceId)
    let users = []
    let students = []
    const { attendances } = response.data
    if (attendances === null) return history.replace('/dashboard/attendance/search')
    const { hours, date, type, createdAt, updatedAt, __v } = attendances
    for (const [index, userData] of attendances.users.entries()) {
      users[index] = {
        text: userData.user.name,
        key: userData.user._id,
        user: userData.user._id,
        status: userData.status
      }
    }
    const classAuthorisedForEdit = classData.map(el => el.value)
    for (const [index, studentData] of attendances.students.entries()) {
      students[index] = {
        text: studentData.student.name,
        key: studentData.student._id,
        student: studentData.student._id,
        status: studentData.status
      }
    }
    const compiledAttendanceObject = {
      attendanceDate: new Date(date),
      hours,
      className: attendances.class.className,
      classId: attendances.class._id,
      type,
      users,
      students,
      classAuthorisedForEdit,
      createdAt,
      updatedAt,
      __v
    }
    dispatch({ type: 'initData', compiledAttendanceObject })
  }

  const handleEdit = e => {
    e.preventDefault()
    if (state.edit === false) {
      dispatch({ type: 'setEdit' })
    } else handleSubmit()
  }

  const handleDeletePopup = e => {
    e.preventDefault()
    dispatch({ type: 'updateField', name: 'deleteConfirm', value: true })
  }

  const close = e => {
    e.preventDefault()
    dispatch({ type: 'updateField', name: 'deleteConfirm', value: false })
  }

  const deletePage = async e => {
    e.preventDefault()
    const { attendanceId } = match.params
    const { classId } = state
    dispatch({ type: 'prepDelete' })
    try {
      await axios.delete('attendance', {
        data: {
          attendanceId: [attendanceId],
          classId
        }
      })
      dispatch({ type: 'updateField', name: 'isLoading', value: false })
      history.push('/dashboard/attendance/search')
    } catch (err) {
      dispatch({ type: 'showError', value: err.response.data.error })
    }
  }

  const handleSubmit = () => {
    const { attendanceDate: date, classId, type, students, users, hours, classAuthorisedForEdit } = state
    if (classAuthorisedForEdit.indexOf(classId) === -1) {
      return dispatch({ type: 'showError', value: 'You are not authorised to edit this attendance.' })
    }
    dispatch({ type: 'updateField', name: 'isLoading', value: true })
    const requiredFields = object({
      type: string().required('Was this lesson held? Or was it cancelled?'),
      hours: number('Please enter a valid number of hours').min(0, 'The minimum hour is zero (0)').required('Please provide the number of hours')
    })
    requiredFields.validate({
      type, hours
    }).then(async valid => {
      try {
        await axios.post('attendance', {
          date,
          classId,
          users,
          students,
          hours,
          type
        })
        dispatch({ type: 'successEdit' })
      } catch (err) {
        if (err.response.data) {
          dispatch({ type: 'showError', value: err.response.data.error })
        }
      }
    }).catch(err => {
      if (err.name === 'ValidationError') {
        dispatch({ type: 'showError', value: err.errors })
      }
    }).finally(() => {
      dispatch({ type: 'updateField', name: 'isLoading', value: false })
    })
  }

  const dismiss = () => {
    dispatch({ type: 'updateField', name: 'submitSuccess', value: false })
  }
  /*
  ===============
  RENDER
  ===============
  */

  const { submitSuccess, edit, buttonName, deleteConfirm, isLoading, errorMessage, classAuthorisedForEdit, classId, createdAt, updatedAt, __v } = state
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      {(submitSuccess || errorMessage) &&
      <Grid.Row>
        <Grid.Column>
          <Message success hidden={!submitSuccess} onDismiss={dismiss} icon='save' header='Success!' content='Attendance saved!' />
          <Message negative hidden={!errorMessage} icon='exclamation circle' header='Error!' content={errorMessage} />
        </Grid.Column>
      </Grid.Row>
      }
      <Grid.Row>
        <Grid.Column>
          <Form onSubmit={handleEdit}>
            <AddEditForm state={state} dispatch={dispatch} newAttendance={false} edit={edit} />
            {(roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1 || classAuthorisedForEdit.indexOf(classId) !== -1) &&
              <React.Fragment>
                <Button value='submit' type='submit' icon labelPosition='left' positive={edit}>
                  <Icon name='edit' />
                  {buttonName}
                </Button>
                <Button negative onClick={handleDeletePopup} type='button' icon labelPosition='left'>
                  <Icon name='trash' />
                Delete
                </Button>
              </React.Fragment>
            }
          </Form>
        </Grid.Column>
      </Grid.Row>
      <Modal open={deleteConfirm} basic size='small'>
        <Header icon='archive' content='Delete Attendance' />
        <Modal.Content>
          <p>Are you sure you want to delete? This action is completely irreversible.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' inverted onClick={close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='green' inverted onClick={deletePage}>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
      <Grid.Row>
        <Grid.Column>
          <List size='mini' horizontal bulleted>
            <List.Item><Popup size='mini' trigger={<div>Latest update {moment(updatedAt).fromNow()}</div>} content={moment(updatedAt).format('LLL')} /></List.Item>
            <List.Item>Edited {__v} times</List.Item>
            <List.Item><Popup size='mini' trigger={<div>Created {moment(createdAt).fromNow()}</div>} content={moment(createdAt).format('LLL')} /></List.Item>
          </List>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

AttendanceView.propTypes = {
  match: PropTypes.object.isRequired,
  classData: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
}

export default AttendanceView
