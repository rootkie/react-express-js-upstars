import React, { useEffect, useReducer } from 'react'
import { Form, Message, Header, Dimmer, Loader, Grid, Popup, List } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'
import StudentList from './Student'
import UserList from './User'

const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const statusOptions = [
  { key: 'Active', text: 'Active', value: 'Active' },
  { key: 'Stopped', text: 'Stopped', value: 'Stopped' }
]

/*
  @param {array} studentList / userList - The compiled list of students and users respectively to be added
  @param {array} studentSelected / userSelected - The compiled list of students and users marked (ticked) respectively
   @param {array} studentOptions / userOptions - 'Dropdown' of students / users to select to be aded
*/
const initialState = {
  overallClassData: {
    'students': [],
    'users': []
  },
  studentList: [],
  userList: [],
  studentSelected: [],
  userSelected: [],
  isLoading: true,
  edit: false,
  submitSuccess: false,
  errorMessage: '',
  buttonContent: 'Edit Class Information',
  cloneLink: '',
  cloneMessage: false,

  // State below are for the search bar
  isLoadingUser: false,
  valueUser: '',
  userOptions: [],

  isLoadingStudent: false,
  valueStudent: '',
  studentOptions: []
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        isLoading: true
      }
    case 'setClassData':
      return {
        ...state,
        overallClassData: action.data,
        isLoading: false
      }
    case 'updateField':
      const { name, value } = action
      return {
        ...state,
        overallClassData: {
          ...state.overallClassData,
          [name]: value
        }
      }
    case 'editMode':
      return {
        ...state,
        edit: true,
        buttonContent: 'Save Edits'
      }
    case 'closeEdit':
      return {
        ...state,
        edit: false,
        buttonContent: 'Edit Class Information',
        submitSuccess: true,
        overallClassData: {
          ...state.overallClassData,
          updatedAt: moment(),
          __v: state.overallClassData.__v + 1
        }
      }
    case 'closeMessage':
      return {
        ...state,
        submitSuccess: false
      }
    case 'showError':
      return {
        ...state,
        errorMessage: action.error
      }
    case 'handleChange':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'addStudentSuccess':
      return {
        ...state,
        isLoading: false,
        submitSuccess: true,
        studentList: []
      }
    case 'deleteStudentSuccess':
      return {
        ...state,
        isLoading: false,
        submitSuccess: true,
        studentSelected: []
      }
    case 'searchChangeStudent':
      return {
        ...state,
        isLoadingStudent: true,
        valueStudent: action.value
      }
    case 'resetSearch':
      return {
        ...state,
        isLoadingStudent: false,
        isLoadingUser: false,
        valueStudent: '',
        valueUser: '',
        resultsStudent: [],
        resultsUser: []
      }
    case 'setStudentOption':
      return {
        ...state,
        studentOptions: action.studentOptions,
        isLoadingStudent: false
      }
    case 'addUserSuccess':
      return {
        ...state,
        isLoading: false,
        submitSuccess: true,
        userList: []
      }
    case 'deleteUserSuccess':
      return {
        ...state,
        isLoading: false,
        submitSuccess: true,
        userSelected: []
      }
    case 'searchChangeUser':
      return {
        ...state,
        isLoadingUser: true,
        valueUser: action.value
      }
    case 'setUserOption':
      return {
        ...state,
        userOptions: action.userOptions,
        isLoadingUser: false
      }
    case 'cloneSuccess':
      return {
        ...state,
        cloneMessage: true,
        cloneLink: action.link
      }
    case 'reload':
      return {
        ...initialState
      }
    default:
      return state
  }
}

const ClassEdit = ({editClass, roles, match, history}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({type: 'reload'})
    const classId = match.params.id
    getClass(classId)
  }, [match.params.id])

  const getClass = async (classId) => {
    try {
      const response = await axios.get('class/' + classId)
      dispatch({type: 'setClassData', data: response.data.class})
    } catch (err) {
      if (err.response.status === 400) {
        history.replace('/dashboard/classes/view')
      }
    }
  }

  const handleChange = (e, { name, value }) => {
    const { edit } = state
    if (edit) {
      dispatch({type: 'updateField', name, value})
    }
  }

  const handleDateChange = (startDate) => {
    const { edit } = state
    if (edit) {
      dispatch({type: 'updateField', name: 'startDate', value: startDate})
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const { overallClassData, edit } = state
    if (!edit) {
      dispatch({type: 'editMode'})
    } else {
      if (overallClassData.classType === 'Enrichment') {
        overallClassData.dayAndTime = 'nil'
      }
      try {
        await editClass(overallClassData, match.params.id)
        dispatch({type: 'closeEdit'})
        setTimeout(() => { dispatch({type: 'closeMessage'}) }, 5000)
      } catch (error) {
        if (error.response) dispatch({type: 'showError', error: error.response.data.error})
      }
    }
  }

  const cloneClass = e => {
    e.preventDefault()
    axios.get(`/class/clone/${match.params.id}`)
      .then(response => {
        dispatch({type: 'cloneSuccess', link: response.data.newClassId})
      }).catch(err => {
        dispatch({type: 'showError', error: err.response.data.error})
      })
  }

  /*
  ==============
  RENDER
  ==============
  */

  const { submitSuccess, overallClassData, isLoading, buttonContent, errorMessage, edit, cloneLink, cloneMessage } = state
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
      <Grid stackable stretched>
        {errorMessage.length !== 0 &&
          <Grid.Row>
            <Grid.Column>
              <Message
                icon='exclamation triangle'
                hidden={errorMessage.length === 0}
                negative
                header='Error!'
                content={errorMessage}
              />
            </Grid.Column>
          </Grid.Row>
        }
        <Grid.Row>
          <Grid.Column>
            <Header as='h3' dividing>Class information</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form onSubmit={handleSubmit}>
              <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={overallClassData.className} onChange={handleChange} required />
              <Form.Group widths='equal'>
                <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={overallClassData.classType} onChange={handleChange} required />
                <Form.Select label='Status' options={statusOptions} placeholder='Status' name='status' value={overallClassData.status} onChange={handleChange} required />
              </Form.Group>
              <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={overallClassData.venue} onChange={handleChange} required />
              <Form.Field>
                <label>Starting Date</label>
                <DatePicker
                  placeholderText='Click to select a date'
                  dateFormat='DD/MM/YYYY'
                  showMonthDropdown
                  dropdownMode='select'
                  selected={moment(overallClassData.startDate)}
                  onChange={handleDateChange}
                  required />
              </Form.Field>
              <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={overallClassData.dayAndTime} onChange={handleChange} required={overallClassData.classType === 'Tuition'} disabled={overallClassData.classType === 'Enrichment'} />
              {roles.indexOf('SuperAdmin') !== -1 &&
              <Form.Group>
                <Form.Button content={buttonContent} type='submit' value='Submit' icon='edit' labelPosition='left' />
                { edit &&
                <Form.Button content={'Clone this class'} type='button' icon='clone' labelPosition='right' primary onClick={cloneClass} />
                }
              </Form.Group>
              }
              {submitSuccess &&
              <Message
                icon='save'
                positive
                header='Success!'
                content='Class successfully edited'
              /> }
              {cloneMessage &&
              <Message info>
                A new class has been duplicated. <Link to={cloneLink}>Click here to view it.</Link>
              </Message>
              }
              <br />
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <StudentList state={state} roles={roles} dispatch={dispatch} id={match.params.id} getClass={getClass} />
            <UserList state={state} roles={roles} dispatch={dispatch} id={match.params.id} getClass={getClass} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List size='mini' horizontal bulleted>
              <List.Item><Popup size='mini' trigger={<div>Latest update {moment(overallClassData.updatedAt).fromNow()}</div>} content={moment(overallClassData.updatedAt).format('LLL')} /></List.Item>
              <List.Item>Edited {overallClassData.__v} times</List.Item>
              <List.Item><Popup size='mini' trigger={<div>Created {moment(overallClassData.createdAt).fromNow()}</div>} content={moment(overallClassData.createdAt).format('LLL')} /></List.Item>
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

ClassEdit.propTypes = {
  editClass: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
}

export default ClassEdit
