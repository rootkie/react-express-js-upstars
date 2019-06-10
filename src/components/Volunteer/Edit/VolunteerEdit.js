import React, { useEffect, useReducer, useCallback, useMemo } from 'react'
import { Form, Button, Header, Icon, Menu, Message, Dimmer, Loader, Modal, Grid, List, Popup } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { string, object, date, array } from 'yup'
import moment from 'moment'
import PersonalInfo from './PersonalInfo'
import FamilyDetails from './FamilyDetails'
import PersonalStatement from './PersonalStatement'
import Office from './Office'
import ClassView from './ClassView'

const initialState = {
  name: '',
  address: '',
  gender: '',
  nric: '',
  handphone: '',
  postalCode: '',
  homephone: '',
  fatherName: '',
  fatherOccupation: '',
  fatherEmail: '',
  motherName: '',
  motherOccupation: '',
  motherEmail: '',
  hobbies: '',
  careerGoal: '',
  schoolClass: '',
  schoolLevel: '',
  admin: {
    interviewDate: undefined,
    interviewNotes: '',
    adminNotes: '',
    commencementDate: undefined
  },

  /* Education / Training */
  formalEducation: [],
  coursesSeminar: [],
  achievements: [],
  cca: [],
  cip: [],
  workInternExp: [],
  languages: '',
  subjects: '',
  interests: '',
  exitDate: undefined,
  preferredTimeSlot: {
    'Monday 7-9.30pm': false,
    'Tuesday 7-9.30pm': false,
    'Wednesday 7-9.30pm': false,
    'Thursday 7-9.30pm': false,
    'Friday 7-9.30pm': false,
    'Saturday 10-12.30pm': false,
    'Saturday 12.15-1.15pm': false,
    'Saturday 12.00-2.30pm': false
  },
  classes: [],
  isLoading: true,
  activeItem: 'Personal Info',
  errorMessage: '',
  edit: false,
  buttonContent: 'Toggle Edit Mode',
  success: false,
  deactivate: false,
  createdAt: undefined,
  updatedAt: undefined,
  __v: 0
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'initUser':
      return {
        ...state,
        ...action.userData,
        isLoading: false
      }
    case 'updateAdminField':
      return {
        ...state,
        admin: {
          ...state.admin,
          [action.name]: action.value
        }
      }
    case 'toggleEdit':
      return {
        ...state,
        edit: true,
        success: false,
        buttonContent: 'Submit and Confirm Edits'
      }
    case 'beforeSubmit':
      return {
        ...state,
        isLoading: true,
        errorMessage: ''
      }
    case 'submitSuccess':
      return {
        ...state,
        isLoading: false,
        edit: false,
        success: true,
        buttonContent: 'Toggle Edit Mode'
      }
    case 'setErrorMessage':
      return {
        ...state,
        isLoading: false,
        success: false,
        errorMessage: action.value
      }
    default:
      return state
  }
}

const VolunteerEdit = ({ history, match, roles }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getProfile(match.params.userId)
  }, [match.params.userId])

  const getProfile = async (userId) => {
    try {
      const response = await axios.get(`/users/${userId}`)
      const { dob, exitDate, preferredTimeSlot } = response.data.user
      let userData = {
        ...response.data.user,
        dob: new Date(dob),
        exitDate: new Date(exitDate),
        preferredTimeSlot: {
          'Monday 7-9.30pm': preferredTimeSlot.includes('Monday 7-9.30pm'),
          'Tuesday 7-9.30pm': preferredTimeSlot.includes('Tuesday 7-9.30pm'),
          'Wednesday 7-9.30pm': preferredTimeSlot.includes('Wednesday 7-9.30pm'),
          'Thursday 7-9.30pm': preferredTimeSlot.includes('Thursday 7-9.30pm'),
          'Friday 7-9.30pm': preferredTimeSlot.includes('Friday 7-9.30pm'),
          'Saturday 10-12.30pm': preferredTimeSlot.includes('Saturday 10-12.30pm'),
          'Saturday 12.15-1.15pm': preferredTimeSlot.includes('Saturday 10-12.30pm'),
          'Saturday 12.00-2.30pm': preferredTimeSlot.includes('Saturday 12.00-2.30pm')
        }
      }
      if (roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Admin') !== -1) {
        const { interviewDate, commencementDate } = userData.admin
        userData = {
          ...userData,
          admin: {
            ...userData.admin,
            interviewDate: interviewDate ? new Date(interviewDate) : undefined,
            commencementDate: commencementDate ? new Date(commencementDate) : undefined
          }
        }
      }
      dispatch({ type: 'initUser', userData })
    } catch (err) {
      if (err.response.status === 400) history.replace('/dashboard/volunteer/view')
    }
  }

  // Most of these edit functions are only allowed when edit mode to toggled to true.
  /*
  ===============
  FUNCTIONS
  ===============
  */
  const handleChange = (e, { name, value }) => {
    if (state.edit === true) {
      dispatch({ type: 'updateField', name, value })
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (state.edit === false) {
      dispatch({ type: 'toggleEdit' })
      return
    }
    dispatch({ type: 'beforeSubmit' })

    const { address, postalCode, handphone, homephone, schoolLevel, schoolClass, exitDate, admin,
      fatherName, fatherOccupation, fatherEmail, motherName, motherOccupation, motherEmail, preferredTimeSlot,
      hobbies, careerGoal, formalEducation, coursesSeminar, achievements, cca, cip, workInternExp, languages, subjects, interests } = state

    const timeSlot = Object.keys(preferredTimeSlot).reduce((last, curr) => (preferredTimeSlot[curr] ? last.concat(curr) : last), [])
    const fieldsToValidate = object({
      admin: object().shape({
        interviewDate: date('Please provide a valid interview date'),
        commencementDate: date('Please provide a valid commencement date')
      }),
      fatherEmail: string().email('Please provide a valid email (Father)'),
      motherEmail: string().email('Please provide a valid email (Mother)'),
      exitDate: date().required('Please enter a valid exit date'),
      timeSlot: array().required('Please provide your preferred time slots'),
      homephone: string().required('Please provide a homephone number').matches(/^6\d{7}$/, 'Please provide a valid homephone number'),
      handphone: string().required('Please provide a handphone number').matches(/^[8|9]\d{7}$/, 'Please provide a valid handphone number'),
      schoolLevel: string().required('Please provide your schooling level'),
      schoolClass: string().required('Please provide your school class'),
      postalCode: string().required('Please provide a postal code').matches(/^\d{6}$/, 'Please provide a valid postal code'),
      address: string().required('Please provide an address')
    }, { abortEarly: true })

    fieldsToValidate
      .validate({ address, postalCode, handphone, homephone, schoolLevel, schoolClass, exitDate, fatherEmail, motherEmail, timeSlot, admin })
      .then(valid => {
        const volunteerData = {
          userId: match.params.userId,
          exitDate,
          preferredTimeSlot: timeSlot,
          address,
          postalCode,
          handphone,
          homephone,
          schoolClass,
          schoolLevel,
          fatherName,
          fatherEmail,
          fatherOccupation,
          motherName,
          motherOccupation,
          motherEmail,
          hobbies,
          careerGoal,
          formalEducation,
          coursesSeminar,
          achievements,
          cca,
          cip,
          workInternExp,
          languages,
          interests,
          subjects,
          admin
        }

        axios.post('/users', volunteerData)
          .then(async response => {
            await getProfile(match.params.userId)
            dispatch({ type: 'submitSuccess' })
          })
          .catch((err) => {
            dispatch({ type: 'setErrorMessage', value: err.response.data.error })
          })
      }).catch(err => {
        if (err.name === 'ValidationError') {
          dispatch({ type: 'setErrorMessage', value: err.errors })
        }
      })
  }

  const handleItemClick = useCallback((e, { name }) => dispatch({ type: 'updateField', name: 'activeItem', value: name }), [state.activeItem])

  const deactivateAccount = useCallback((e) => {
    dispatch({ type: 'updateField', name: 'deactivate', value: true })
  }, [state.deactivate])

  const handleDeactivate = useCallback((e) => {
    const { userId } = match.params
    axios.delete('users', { data: {
      userId
    }
    })
      .then(response => {
        window.localStorage.removeItem('token')
        window.localStorage.removeItem('refreshToken')
        history.replace('/')
      }).catch(err => {
        dispatch({ type: 'setErrorMessage', value: err.response.data.error })
      })
  }, [match.params.userId])

  const handleClose = useCallback((e) => {
    dispatch({ type: 'updateField', name: 'deactivate', value: false })
  }, [state.deactivate])

  /*
  =============
  RENDER
  =============
  */

  const { buttonContent, classes, edit, activeItem, errorMessage, isLoading, deactivate, createdAt, updatedAt, __v, success } = state

  return (
    <Grid stackable stretched>
      <Dimmer page active={isLoading}>
        <Loader indeterminate active={isLoading}>Loading Data</Loader>
      </Dimmer>
      {/* Performance optimisation to prevent excessive re-render. Roles is excluded because React works differently and cannot compute arrays well */}
      {useMemo(() => (
        <Grid.Row>
          <Grid.Column>
            <Menu attached='top' fluid pointing stackable>
              <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={handleItemClick} color={'red'}><Icon name='user' />Personal Info</Menu.Item>
              <Menu.Item name='Family Details' active={activeItem === 'Family Details'} onClick={handleItemClick} color={'blue'}><Icon name='info circle' />Family Details</Menu.Item>
              <Menu.Item name='Personal Statement' active={activeItem === 'Personal Statement'} onClick={handleItemClick} color={'orange'}><Icon name='write' />Personal Statement</Menu.Item>
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <Menu.Item name='For office use' active={activeItem === 'For office use'} onClick={handleItemClick} color={'green'}><Icon name='dashboard' />For office use</Menu.Item>
              }
            </Menu>
          </Grid.Column>
        </Grid.Row>
      ), [handleItemClick, activeItem])}
      <Grid.Row>
        <Grid.Column>

          <Form onSubmit={handleSubmit}>
            { activeItem === 'Personal Info' &&
              <PersonalInfo state={state} handleChange={handleChange} dispatch={dispatch} />
            }
            {activeItem === 'Family Details' &&
              <FamilyDetails state={state} handleChange={handleChange} />
            }
            {activeItem === 'Personal Statement' &&
              <PersonalStatement state={state} handleChange={handleChange} dispatch={dispatch} />
            }
            {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) && activeItem === 'For office use' &&
              <Office admin={state.admin} dispatch={dispatch} edit={edit} />
            }
            <Message
              hidden={errorMessage.length === 0}
              icon='exclamation'
              header='Error!'
              negative
              content={errorMessage}
            />
            <Message
              hidden={success === false}
              icon='sync'
              header='Success!'
              positive
              content='User particulars have been successfully edited.'
            />
            <Form.Button type='sumbit' icon='edit' labelPosition='left' content={buttonContent} />
          </Form>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <ClassView classes={classes} />
        </Grid.Column>
      </Grid.Row>
      {useMemo(() => (
        <React.Fragment>
          <Grid.Row>
            <Grid.Column>
              <Header as='h3' dividing>Personal Settings</Header>
              <Button negative animated='vertical' onClick={deactivateAccount}>
                <Button.Content visible>Deactivate your account</Button.Content>
                <Button.Content hidden>
                  <Icon name='trash' />
                </Button.Content>
              </Button>
              <Modal open={deactivate} dimmer='blurring' size='large'>
                <Modal.Header>Is this goodbye?</Modal.Header>
                <Modal.Content>
                  <Modal.Description>
                    <Header>Before you go...</Header>
                    <p>Note that the account deactivation is highly irreverisble</p>
                    <p>UPStars thank you for being with us. We hope to have you onboard again!</p>
                  </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                  <Button negative icon='close' labelPosition='right' content='Never mind, keep my account' onClick={handleClose} />
                  <Button positive icon='checkmark' labelPosition='right' content='Deactivate' onClick={handleDeactivate} />
                </Modal.Actions>
              </Modal>
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
        </React.Fragment>
      ), [updatedAt, createdAt, __v, handleDeactivate, handleClose, deactivateAccount])}
    </Grid>
  )
}

VolunteerEdit.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default VolunteerEdit
