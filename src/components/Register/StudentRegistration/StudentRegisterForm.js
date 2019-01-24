import React, { useReducer } from 'react'
import FamilyDetails from '../StudentRegistration/FamilyDetails'
import PersonalInfo from '../StudentRegistration/PersonalInfo'
import { Form, Message, Header, Icon, Segment, Image, Grid, Step } from 'semantic-ui-react'
import axios from 'axios'
import { string, object, boolean, date } from 'yup'
import ReCAPTCHA from 'react-google-recaptcha'
const recaptchaRef = React.createRef()

const initialState = {
  // Student Information
  studentName: '',
  studentIcNumber: '',
  studentDob: undefined,
  studentAddress: '',
  studentGender: '',
  studentNationality: '',
  studentClassLevel: '',
  studentSchoolName: '',

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
  academicInfo: [], // {year, term, english, math, motherTongue, science, overall}

  /* Terms and conditions */
  terms: false,
  termsDetails: false,

  tuitionChoices: {
    CDAC: false,
    Mendaki: false,
    Private: false
  },

  captchaCode: '',
  errorMessage: '',
  submitSuccess: false,
  activeItem: 'Personal Info'
}

// Reducers here contains all the actions to modify the state. It is a top Level function that
// should not contain any API calls. Loops, conditions and API calls should be done before an action
// is called for the reducer to initate a state change. State in this case is immutable.
const reducer = (state, action) => {
  switch (action.type) {
    // Field Updates
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value || action.checked
      }
    case 'updateAcademic': {
      let newAcademicInfo = [...state.academicInfo]
      let { index, property, value } = action
      newAcademicInfo[index][property] = value
      return {
        ...state,
        academicInfo: newAcademicInfo
      }
    }
    case 'updateFamilyMember': {
      let newOtherFamily = [...state.otherFamily]
      let { index, property, value } = action
      newOtherFamily[index][property] = value
      return {
        ...state,
        otherFamily: newOtherFamily
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
    // Increments and Decrements
    case 'incrementAcademic':
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
    case 'decrementAcademic':
      return {
        ...state,
        academicInfo: state.academicInfo.slice(0, -1)
      }
    case 'incrementFamilyMember':
      const newFamilyMemberEmptyArray = [{
        name: '',
        relationship: '',
        age: ''
      }]
      return {
        ...state,
        otherFamily: state.otherFamily.concat(newFamilyMemberEmptyArray)
      }
    case 'decrementFamilyMember':
      return {
        ...state,
        otherFamily: state.otherFamily.slice(0, -1)
      }
    // Terms
    case 'handleTermsOpen':
      if (!state.terms) {
        return {
          ...state,
          termsDetails: true
        }
      } else {
        return {
          ...state,
          terms: false
        }
      }
    case 'handleTermsClose':
      return {
        ...state,
        terms: true,
        termsDetails: false
      }
    case 'handleTermsDisagree':
      return {
        ...state,
        terms: false,
        termsDetails: false
      }
    // ReCaptcha
    case 'captchaChange':
      return {
        ...state,
        captchaCode: recaptchaRef.current.getValue()
      }
    case 'captchaExpired':
      return {
        ...state,
        terms: false,
        captchaCode: '',
        errorMessage: 'Timeout, please review and accept the terms again.'
      }
    case 'showSuccess':
      return {
        ...initialState,
        submitSuccess: true
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

const submitPersonal = (dispatch, state) => e => {
  e.preventDefault()
  dispatch({type: 'clearError'})
  if (state.activeItem === 'Family Details') {
    dispatch({type: 'updateField', name: 'activeItem', value: 'Personal Info'})
  } else {
    const {
      studentName, studentIcNumber, studentDob, studentAddress, studentGender, studentNationality, studentClassLevel, studentSchoolName
    } = state
    const requiredSchema = object({
      studentSchoolName: string().required('Please provide your school name'),
      studentClassLevel: string().required('Please provide your class and level'),
      studentNationality: string().required('Please provide your nationality'),
      studentGender: string().required('Please provide your gender'),
      studentAddress: string().required('Please provide a valid address'),
      studentDob: date('Please provide a valid date'),
      studentIcNumber: string().required('Please provide an IC number').uppercase().matches(/^[STFG]\d{7}[A-Z]$/, 'Please provide a valid IC Number'),
      studentName: string().required('Please provide your name')
    })
    requiredSchema.validate({
      studentName, studentIcNumber, studentDob, studentAddress, studentGender, studentNationality, studentClassLevel, studentSchoolName
    }, {abortEarly: true}).then(valid => {
      dispatch({type: 'updateField', name: 'activeItem', value: 'Family Details'})
    }).catch(err => {
      if (err.name === 'ValidationError') {
        dispatch({type: 'updateField', name: 'errorMessage', value: err.errors})
      }
    })
  }
}

const submitAll = (dispatch, state) => e => {
  e.preventDefault()
  dispatch({type: 'clearError'})

  const {
    studentName, studentIcNumber, studentDob, studentAddress, studentGender, studentNationality, studentClassLevel, studentSchoolName, terms,
    fatherName, fatherIcNumber, fatherNationality, fatherContactNumber, fatherEmail, fatherOccupation, fatherIncome, motherName, motherIcNumber,
    motherNationality, motherContactNumber, motherEmail, motherOccupation, motherIncome, otherFamily, fas, fsc, academicInfo, tuitionChoices, captchaCode
  } = state

  // Validate the important details
  const requriedSchema = object({
    studentName: string().required('Please provide your name'),
    studentIcNumber: string().required('Please provide an IC number').uppercase().matches(/^[STFG]\d{7}[A-Z]$/, 'Please provide a valid IC Number'),
    studentDob: date('Please provide a valid date'),
    studentAddress: string().required('Please provide a valid address'),
    studentGender: string().required('Please provide your gender'),
    studentNationality: string().required('Please provide your nationality'),
    studentClassLevel: string().required('Please provide your class and level'),
    studentSchoolName: string().required('Please provide your school name'),
    terms: boolean().oneOf([true], 'Please accept the terms and conditions'),
    captchaCode: string().required('There is an error with the CaptchaCode, please try again')
  })

  requriedSchema.validate({
    studentName, studentIcNumber, studentDob, studentAddress, studentGender, studentNationality, studentClassLevel, studentSchoolName, terms, captchaCode
  }).then(valid => {
    let studentDataToSubmit = {
      profile: {
        name: studentName,
        icNumber: studentIcNumber,
        dob: studentDob,
        address: studentAddress,
        gender: studentGender,
        nationality: studentNationality,
        classLevel: studentClassLevel,
        schoolName: studentSchoolName
      },
      father: {
        name: fatherName,
        icNumber: fatherIcNumber,
        nationality: fatherNationality,
        contactNumber: fatherContactNumber,
        email: fatherEmail,
        occupation: fatherOccupation,
        income: fatherIncome
      },
      mother: {
        name: motherName,
        icNumber: motherIcNumber,
        nationality: motherNationality,
        contactNumber: motherContactNumber,
        email: motherEmail,
        occupation: motherOccupation,
        income: motherIncome
      },
      otherFamily,
      misc: {
        fas,
        fsc,
        academicInfo
      },
      captchaCode
    }
    // Simply put: Take the keys of tuitonChoices (CDAC, Mendaki, Private) and reduce it
    // if the current value is true, that choice (known as current) would be added to the list of total choices (known as last)
    // else if that option is not checked (false), the list will remain the same as before (nothing added)
    const tuition = Object.keys(tuitionChoices).reduce((last, current) => (tuitionChoices[current] ? last.concat(current) : last
    ), [])

    studentDataToSubmit.misc = {...studentDataToSubmit.misc, tuition} // adding tuition info into misc

    axios.post('/students', studentDataToSubmit)
      .then(response => {
        console.log('success')
        // The reset is so that the timeout error will not appear after successful submission
        recaptchaRef.current.reset()
        dispatch({type: 'showSuccess'})
      })
      .catch(error => {
        console.log(error.response)
        recaptchaRef.current.reset()
        dispatch({type: 'updateField', name: 'terms', value: false})
        dispatch({type: 'updateField', name: 'errorMessage', value: error.response.data.error})
      })
  }).catch(err => {
    if (err.name === 'ValidationError') {
      dispatch({type: 'updateField', name: 'errorMessage', value: err.errors})
    }
  })
}

// Main Functional Component to be rendered in the React App.
const StudentForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  // New React Hooks. Refer to https://reactjs.org/docs/hooks-reference.html#usereducer for more details on useReducer hook.
  const { activeItem, errorMessage, submitSuccess } = state

  // Function to handle state change
  const handleChange = (e, {name, value, checked}) => {
    dispatch({type: 'updateField', name, value, checked})
  }

  const updateAcademic = (index, property) => (e, {value}) => {
    e.preventDefault()
    dispatch({type: 'updateAcademic', index, property, value})
  }

  const updateFamilyMember = (index, property) => (e, {value}) => {
    e.preventDefault()
    dispatch({type: 'updateFamilyMember', index, property, value})
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
              Sign up as a student
            </Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Step.Group attached='top'>
              <Step active={activeItem === 'Personal Info'} completed={activeItem === 'Family Details'}>
                <Icon name='user' />
                <Step.Content>
                  <Step.Title>Personal Info</Step.Title>
                  <Step.Description>Fill in your personal details</Step.Description>
                </Step.Content>
              </Step>
              <Step disabled={activeItem !== 'Family Details'} active={activeItem === 'Family Details'}>
                <Icon name='info circle' />
                <Step.Content>
                  <Step.Title>Family & Misc</Step.Title>
                  <Step.Description>Enter family details</Step.Description>
                </Step.Content>
              </Step>
            </Step.Group>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
              { activeItem === 'Personal Info' && <PersonalInfo dispatch={dispatch} state={state} handleChange={handleChange} updateAcademic={updateAcademic} /> }
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Form>
              { activeItem === 'Family Details' && <FamilyDetails dispatch={dispatch} state={state} handleChange={handleChange} updateFamilyMember={updateFamilyMember} recaptchaRef={recaptchaRef} /> }
            </Form>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Form>
            <Message
              hidden={errorMessage.length === 0 || !errorMessage}
              negative
              content={errorMessage}
            />
            <Message
              hidden={!submitSuccess}
              positive
              content='Successfully Submitted and saved'
            />
            <Form.Group>
              <Form.Button primary onClick={submitPersonal(dispatch, state)}>{activeItem === 'Personal Info' ? 'Continue' : 'Back'}</Form.Button>
              <Form.Button disabled={activeItem !== 'Family Details'} onClick={submitAll(dispatch, state)}>Register as student</Form.Button>
            </Form.Group>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='invisible'
              sitekey='6LdCS1IUAAAAAHaYU_yJyFimpPuJShH-i80kFj3F' // Dev key under Ying Keat's account (yingkeatwon@gmail.com)
              onChange={() => dispatch({type: 'captchaChange'})}
              onExpired={() => dispatch({type: 'captchaExpired'})}
            />
          </Form>
        </Grid.Row>
      </Grid>
    </Segment>
  )
}

export default StudentForm
