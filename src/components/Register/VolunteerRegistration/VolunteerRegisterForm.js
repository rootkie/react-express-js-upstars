import React, { useReducer } from 'react'
import { Form, Header, Icon, Segment, Image, Message, Grid, Step } from 'semantic-ui-react'
import LoginDetails from './LoginDetails'
import PersonalInfo from './PersonalInfo'
import axios from 'axios'
import { string, object, boolean, date, ref, array } from 'yup'
import ReCAPTCHA from 'react-google-recaptcha'
const recaptchaRef = React.createRef()

const initialState = {
  name: '',
  password: '',
  passwordcfm: '',
  address: '',
  handphone: '',
  postalCode: '',
  homephone: '',
  email: '',
  dob: undefined,
  gender: '',
  nationality: '',
  nric: '',
  schoolClass: '',
  schoolLevel: '',
  commencementDate: undefined,
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
  terms: false,
  success: false,
  loading: false,
  termsDetails: false,
  activeItem: 'Login Details',
  captchaCode: '',
  errorMessage: ''
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'updateTimeslot':
      return {
        ...state,
        preferredTimeSlot: {
          ...state.preferredTimeSlot,
          [action.name]: action.checked
        }
      }
    case 'handleTermsOpen':
      return {
        ...state,
        terms: false,
        termsDetails: !state.terms
      }
    case 'handleTermsDisagree':
      return {
        ...state,
        termsDetails: false
      }
    case 'handleTermsClose':
      return {
        ...state,
        termsDetails: false,
        terms: true
      }
    case 'captchaChange':
      return {
        ...state,
        captchaCode: recaptchaRef.current.getValue()
      }
    case 'captchaExpired':
      return {
        ...state,
        activeItem: 'Personal Info',
        terms: false,
        errorMessage: 'Timeout, please review and accept the terms again.'
      }
    case 'clearError':
      return {
        ...state,
        errorMessage: '',
        success: false
      }
    case 'submitSuccess':
      return {
        ...initialState,
        success: true
      }
    default:
      return state
  }
}

/*
===================
SUBMIT FUNCTIONS
===================
*/

const submitPageOne = (dispatch, state) => e => {
  e.preventDefault()
  dispatch({type: 'clearError'})

  // The function is binded to the same button that display 'next' and 'back'
  if (state.activeItem === 'Personal Info') {
    dispatch({type: 'updateField', name: 'activeItem', value: 'Login Details'})
  } else {
    const { email, password, passwordcfm } = state
    const requiredFieldForLogin = object({
      passwordcfm: string().required('Please provide the password confirmation').oneOf([ref('password'), null], 'Passwords do not match'),
      password: string().required('Please provide a password').min(6, 'Please provide a password that has at least 6 characters'),
      email: string().required('Please provide an email address').email('Please provide a valid email')
    })
    requiredFieldForLogin.validate({
      email,
      password,
      passwordcfm
    }, {abortEarly: true}).then(valid => {
      dispatch({type: 'updateField', name: 'activeItem', value: 'Personal Info'})
    }).catch(err => {
      dispatch({type: 'updateField', name: 'errorMessage', value: err.errors})
    })
  }
}

const submitEntry = (dispatch, state) => e => {
  e.preventDefault()
  dispatch({type: 'clearError'})
  dispatch({type: 'updateField', name: 'loading', value: true})
  const { email, password, passwordcfm, name, address, postalCode, schoolClass, schoolLevel, handphone, homephone, dob, gender, nationality, nric,
    preferredTimeSlot, commencementDate, exitDate, terms, captchaCode } = state

  // Timeslot here is calculated to make sure there is at least 1 entry in the array
  const timeSlot = Object.keys(preferredTimeSlot).reduce((last, curr) => (preferredTimeSlot[curr] ? last.concat(curr) : last), [])
  const requiredFieldsForSubmit = object({
    captchaCode: string().required('Please accept the terms again to refresh your reCaptcha verification'),
    terms: boolean().oneOf([true], 'Please accept the terms and conditions'),
    exitDate: date().required('Please enter a valid exit date'),
    commencementDate: date().required('Please enter a valid commencement date'),
    timeSlot: array().required('Please provide your preferred time slots'),
    nric: string().required('Please provide an IC number').uppercase().matches(/^[STFG]\d{7}[A-Z]$/, 'Please provide a valid IC Number'),
    nationality: string().required('Please provide your nationality'),
    gender: string().required('Please provide your gender'),
    dob: date().required('Please enter a valid date of birth'),
    homephone: string().required('Please provide a homephone number').matches(/^6\d{7}$/, 'Please provide a valid homephone number'),
    handphone: string().required('Please provide a handphone number').matches(/^[8|9]\d{7}$/, 'Please provide a valid handphone number'),
    schoolLevel: string().required('Please provide your schooling level'),
    schoolClass: string().required('Please provide your school class'),
    postalCode: string().required('Please provide a postal code').matches(/^\d{6}$/, 'Please provide a valid postal code'),
    address: string().required('Please provide an address'),
    name: string().required('Please provide your name'),
    passwordcfm: string().oneOf([ref('password'), null], 'Passwords do not match').required('Please provide the password confirmation'),
    password: string().required('Please provide a password').min(6, 'Please provide a password that has at least 6 characters'),
    email: string().required('Please provide an email address').email('Please provide a valid email')
  }, {abortEarly: true})

  // Validate the object against the params written above
  requiredFieldsForSubmit
    .validate({email, password, passwordcfm, name, address, postalCode, schoolClass, schoolLevel, handphone, homephone, dob, gender, nationality, nric, timeSlot, commencementDate, exitDate, terms, captchaCode})
    .then(valid => {
      const volunteerData = {
        email,
        password,
        commencementDate,
        exitDate,
        preferredTimeSlot: timeSlot,
        name,
        dob,
        gender,
        nationality,
        nric,
        address,
        postalCode,
        handphone,
        homephone,
        schoolClass,
        schoolLevel,
        captchaCode
      }

      axios.post('/register', volunteerData)
        .then(response => {
          recaptchaRef.current.reset()
          dispatch({type: 'submitSuccess'})
        })
        .catch((err) => {
          dispatch({type: 'updateField', name: 'loading', value: false})
          dispatch({type: 'updateField', name: 'terms', value: false})
          recaptchaRef.current.reset()
          if (err.response.data) dispatch({type: 'updateField', name: 'errorMessage', value: err.response.data.error})
        })
    }).catch(err => {
      if (err.name === 'ValidationError') {
        dispatch({type: 'updateField', name: 'loading', value: false})
        dispatch({type: 'updateField', name: 'errorMessage', value: err.errors})
      }
    })
}

/*
===================
MAIN FUNCTION
===================
*/

const VolunteerRegister = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { activeItem, errorMessage, success, loading } = state

  const handleChange = (e, {name, value}) => {
    dispatch({type: 'updateField', name, value})
  }

  return (
    <Segment style={{ padding: '3em 0em' }} vertical>
      <Grid container stackable verticalAlign='middle'>
        <Grid.Row>
          <Image size='small' centered src={require('../../Misc/logo.png')} style={{height: '100%'}} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign='center'>
            <Header as='h1' color='blue'>
                Sign up as a volunteer
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Step.Group attached='top'>
              <Step active={activeItem === 'Login Details'} completed={activeItem === 'Personal Info'}>
                <Icon name='lock' />
                <Step.Content>
                  <Step.Title>Register</Step.Title>
                  <Step.Description>Fill in your login details</Step.Description>
                </Step.Content>
              </Step>
              <Step disabled={activeItem !== 'Personal Info'} active={activeItem === 'Personal Info'}>
                <Icon name='user' />
                <Step.Content>
                  <Step.Title>Personal Details</Step.Title>
                  <Step.Description>Enter personal information</Step.Description>
                </Step.Content>
              </Step>
            </Step.Group>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
              {activeItem === 'Login Details' && <LoginDetails state={state} handleChange={handleChange} />}
              { activeItem === 'Personal Info' && <PersonalInfo dispatch={dispatch} state={state} handleChange={handleChange} recaptchaRef={recaptchaRef} />}
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
              <Message icon hidden={!loading}>
                <Icon name='circle notched' loading />
                <Message.Content>
                  <Message.Header>Just a moment</Message.Header>
                  We are currently creating your account.
                </Message.Content>
              </Message>
              <Message
                hidden={success === false}
                positive
                icon='user plus'
                header='Success!'
                content='Success! Please check your email for verification link'
              />
              <Message
                hidden={errorMessage.length === 0 || !errorMessage}
                negative
                icon='exclamation circle'
                header='Error!'
                content={errorMessage}
              />
              <Form.Group>
                <Form.Button primary type='button' onClick={submitPageOne(dispatch, state)}>{activeItem === 'Login Details' ? 'Continue' : 'Back'}</Form.Button>
                <Form.Button disabled={activeItem !== 'Personal Info'} onClick={submitEntry(dispatch, state)}>Register as volunteer</Form.Button>
              </Form.Group>
              <ReCAPTCHA
                ref={recaptchaRef}
                size='invisible'
                sitekey='6LcfaJAUAAAAAGeIFvZbriv8zPaPFXqpq0qjQkNa' // Dev key under Ying Keat's account
                onChange={() => dispatch({type: 'captchaChange'})}
                onExpired={() => dispatch({type: 'captchaExpired'})}
              />
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
}

export default VolunteerRegister
