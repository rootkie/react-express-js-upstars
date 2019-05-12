import React, { useReducer } from 'react'
import { Form, Message, Icon, Menu, Grid } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
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

  /* Official use */
  admin: {
    interviewDate: undefined,
    interviewNotes: '',
    commencementDate: undefined,
    adminNotes: '',
    exitDate: undefined,
    exitReason: ''
  },
  status: 'Active',
  errorMessage: '',
  activeItem: 'Personal Info',
  successRedirect: false,
  redirectLink: ''
}

const reducer = (state, action) => {
  switch (action.type) {
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
    default:
      return state
  }
}

/*
==================
FUNCTIONS
==================
*/

const submitStudent = (state, dispatch, addStudent) => async e => {
  e.preventDefault()
  dispatch({type: 'clearError'})

  const response = await useValidateStudent(state)
  if (response.status === true) {
    const { studentDataToSubmit } = response
    try {
      const newStudentId = await addStudent(studentDataToSubmit)
      dispatch({type: 'updateField', name: 'redirectLink', value: newStudentId})
      dispatch({type: 'updateField', name: 'successRedirect', value: true})
    } catch (error) {
      dispatch({type: 'updateField', name: 'errorMessage', value: error.response.data.error})
    }
  } else {
    const { errors } = response
    dispatch({type: 'updateField', name: 'errorMessage', value: errors})
  }
}

const StudentForm = ({addStudent}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleChange = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value: value})
  }

  const handleActiveChange = (e, {name}) => {
    dispatch(({type: 'changeActive', name}))
  }

  /*
  ===============
  RENDER
  ===============
  */

  const { activeItem, errorMessage, successRedirect, redirectLink } = state
  if (successRedirect) {
    return <Redirect push to={`/dashboard/students/edit/${redirectLink}`} />
  }
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
            <Menu.Item name='Office' active={activeItem === 'Office'} onClick={handleActiveChange} color={'orange'}>
              <Icon name='dashboard' />
              3. For office use
            </Menu.Item>
          </Menu>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {/* <Form onSubmit={}> */}
          <Form>
            { activeItem === 'Personal Info' &&
              <PersonalInfo state={state} dispatch={dispatch} handleChange={handleChange} edit type='add' />
            }
            { activeItem === 'Family Details' &&
              <FamilyDetails state={state} dispatch={dispatch} handleChange={handleChange} edit />
            }
            { activeItem === 'Office' &&
              <Office admin={state.admin} dispatch={dispatch} edit />
            }
            <Message
              icon='exclamation triangle'
              hidden={errorMessage.length === 0 || !errorMessage}
              negative
              header='Error!'
              content={errorMessage}
            />
            <Form.Button type='submit' icon='add' content='Add student' labelPosition='left' onClick={submitStudent(state, dispatch, addStudent)} />
          </Form>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

StudentForm.propTypes = {
  addStudent: PropTypes.func.isRequired
}

export default StudentForm
