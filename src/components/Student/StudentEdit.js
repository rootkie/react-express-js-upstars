import React, { useReducer, useEffect } from 'react'
import { Form, Message, Table, Menu, Dimmer, Loader, Header, Grid, Icon, List, Popup } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import moment from 'moment'
import axios from 'axios'
import { Link } from 'react-router-dom'
import PersonalInfo from './FormShared/PersonalInfo'
import FamilyDetails from './FormShared/FamilyDetails'
import Office from './FormShared/Office'
import { useValidateStudent } from './FormFunctions/validation'

const initialState = {
  /* Student Information */
  name: '',
  icNumber: '',
  dob: undefined,
  address: '',
  gender: '',
  nationality: '',
  classLevel: '',
  schoolName: '',

  /* Family Information */
  fatherName: '',
  fatherIcNumber: '',
  fatherNationality: '',
  fatherContactNumber: '',
  fatherEmail: '',
  fatherOccupation: '',
  fatherIncome: '',

  motherName: '',
  motherIcNumber: '',
  motherNationality: '',
  motherContactNumber: '',
  motherEmail: '',
  motherOccupation: '',
  motherIncome: '',

  otherFamily: [], // each object {name, relationship, age}
  fas: [],
  fsc: '',
  tuitionChoices: {
    CDAC: false,
    Mendaki: false,
    Private: false
  },
  academicInfo: [], // {year, term, english, math, motherTongue, science, overall}
  classes: [],
  /* Official use */
  admin: {
    interviewDate: undefined,
    interviewNotes: '',
    commencementDate: undefined,
    adminNotes: '',
    exitDate: undefined,
    exitReason: ''
  },
  __v: 0,
  createdAt: undefined,
  updatedAt: undefined,
  edit: false,
  errorMessage: '',
  activeItem: 'Personal Info',
  success: false,
  isLoading: true,
  buttonContent: 'Toggle Edit Mode'
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'setStudentState':
      return {
        ...state,
        ...action.studentData,
        isLoading: false
      }
    case 'changeActive':
      return {
        ...state,
        activeItem: action.name
      }
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'updateAdminField':
      return {
        ...state,
        admin: {
          ...state.admin,
          [action.name]: action.value
        }
      }
    case 'updateTuition':
      return {
        ...state,
        tuitionChoices: {
          ...state.tuitionChoices,
          [action.name]: action.checked
        }
      }
    case 'updateFamily':
      const { index, property, value } = action
      let editedFamily = [...state.otherFamily]
      editedFamily[index][property] = value
      return {
        ...state,
        otherFamily: editedFamily
      }
    case 'incFamily':
      const newFamilyArray = [{
        name: '',
        relationship: '',
        age: ''
      }]
      return {
        ...state,
        otherFamily: state.otherFamily.concat(newFamilyArray)
      }
    case 'decFamily':
      return {
        ...state,
        otherFamily: state.otherFamily.slice(0, -1)
      }
    case 'updateAcademic': {
      let newAcademicInfo = [...state.academicInfo]
      const { index, property, value } = action
      newAcademicInfo[index][property] = value
      return {
        ...state,
        academicInfo: newAcademicInfo
      }
    }
    case 'incAcademic':
      const newAcademicEmptyArray = [{
        year: '',
        term: '',
        english: '',
        math: '',
        motherTongue: '',
        science: '',
        overall: ''
      }]
      return {
        ...state,
        academicInfo: state.academicInfo.concat(newAcademicEmptyArray)
      }
    case 'decAcademic':
      return {
        ...state,
        academicInfo: state.academicInfo.slice(0, -1)
      }
    case 'clearError':
      return {
        ...state,
        errorMessage: ''
      }
    case 'toggleEditMode':
      return {
        ...state,
        edit: true,
        buttonContent: 'Save Edits'
      }
    case 'startLoading':
      return {
        ...state,
        isLoading: true
      }
    case 'success':
      return {
        ...state,
        success: true,
        edit: false,
        isLoading: false,
        buttonContent: 'Toggle Edit Mode',
        __v: state.__v + 1,
        updatedAt: moment()
      }
    default:
      return state
  }
}

/*
===============
FUNCTIONS
===============
*/

const toggleButton = (state, dispatch, editStudent, studentId) => async e => {
  e.preventDefault()
  const { edit } = state
  if (!edit) {
    return dispatch({type: 'toggleEditMode'})
  }
  dispatch({type: 'clearError'})
  dispatch({type: 'startLoading'})
  const response = await useValidateStudent(state)
  if (response.status === true) {
    const { studentDataToSubmit } = response
    try {
      await editStudent(studentId, studentDataToSubmit)
      dispatch({type: 'success'})
    } catch (error) {
      dispatch({type: 'updateField', name: 'errorMessage', value: error.response.data.error})
    }
  } else {
    const { errors } = response
    dispatch({type: 'updateField', name: 'errorMessage', value: errors})
    dispatch({type: 'updateField', name: 'isLoading', value: false})
  }
}

const StudentEdit = ({editStudent, match, roles}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const { id } = match.params
    getStudent(id, dispatch)
  }, [match.params.id])

  const getStudent = (studentId) => {
    axios.get(`students/${studentId}`)
      .then(response => {
        const { dob, tuition } = response.data.student
        let studentData = {
          ...response.data.student,
          dob: moment(dob),
          tuitionChoices: {
            CDAC: tuition.includes('CDAC'),
            Mendaki: tuition.includes('Mendaki'),
            Private: tuition.includes('Private')
          }
        }
        delete studentData._id
        if (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) {
          const { commencementDate, interviewDate, exitDate } = response.data.student.admin
          studentData = {
            ...studentData,
            admin: {
              ...studentData.admin,
              commencementDate: commencementDate ? moment(commencementDate) : undefined,
              interviewDate: interviewDate ? moment(interviewDate) : undefined,
              exitDate: exitDate ? moment(exitDate) : undefined
            }
          }
        }
        dispatch({type: 'setStudentState', studentData})
      })
  }

  const handleChange = (e, { name, value }) => {
    if (edit) {
      dispatch({type: 'updateField', name, value: value})
    }
  }

  const handleActiveChange = (e, {name}) => {
    dispatch(({type: 'changeActive', name}))
  }

  /*
  ===========
  RENDER
  ===========
  */

  const { activeItem, errorMessage, edit, isLoading, success, classes, buttonContent, createdAt, updatedAt, __v } = state

  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  } else {
    return (
      <Grid stackable stretched>
        <Grid.Row>
          <Grid.Column>
            <Menu attached='top' pointing fluid stackable>
              <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={handleActiveChange} color={'red'}>
                <Icon name='user' />
              1. Personal Info
              </Menu.Item>
              <Menu.Item name='Family Details' active={activeItem === 'Family Details'} onClick={handleActiveChange} color={'blue'}>
                <Icon name='info circle' />
              2. Family Info
              </Menu.Item>
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <Menu.Item name='Office' active={activeItem === 'Office'} onClick={handleActiveChange} color={'orange'}>
                <Icon name='dashboard' />
              3. For office use
              </Menu.Item>
              }
            </Menu>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
              { activeItem === 'Personal Info' &&
                <PersonalInfo state={state} dispatch={dispatch} handleChange={handleChange} edit={edit} type='edit' />
              }
              { activeItem === 'Family Details' &&
                <FamilyDetails state={state} dispatch={dispatch} handleChange={handleChange} edit={edit} />
              }
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) && activeItem === 'Office' &&
                <Office admin={state.admin} dispatch={dispatch} edit={edit} />
              }
              <Message
                icon='exclamation triangle'
                hidden={errorMessage.length === 0 || !errorMessage}
                negative
                header='Error!'
                content={errorMessage}
              />
              <Message
                icon='save'
                hidden={!success}
                positive
                header='Success!'
                content='Successfully Submitted and saved'
              />
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <Form.Button type='button' content={buttonContent} icon='edit' labelPosition='left' onClick={toggleButton(state, dispatch, editStudent, match.params.id)} />
              }
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Header as='h3' dividing>Classes</Header>
        <Grid.Row>
          <Grid.Column>
            <Table compact celled unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width='1'>S/N</Table.HeaderCell>
                  <Table.HeaderCell width='6'>Name</Table.HeaderCell>
                  <Table.HeaderCell width='5'>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              {classes.length !== 0 &&
              <Table.Body>
                {classes.map((Class, i) => (
                  <Table.Row key={`class-${Class._id}`}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell><Link to={`/dashboard/classes/id/${Class._id}`}>{Class.className}</Link></Table.Cell>
                    <Table.Cell>{Class.status}</Table.Cell>
                  </Table.Row>))}
              </Table.Body>
              }
              {classes.length === 0 &&
              <Table.Body>
                <Table.Row key={`empty-class`}>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>Oops! No Classes Found!</Table.Cell>
                  <Table.Cell>nil</Table.Cell>
                </Table.Row>
              </Table.Body>
              }
            </Table>
          </Grid.Column>
        </Grid.Row>
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
}

StudentEdit.propTypes = {
  editStudent: PropTypes.func,
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default StudentEdit
