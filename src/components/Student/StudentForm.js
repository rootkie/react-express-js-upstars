import React, { useEffect, useReducer } from 'react'
import { Form, Message, Button, Modal, Header, Table, Icon, Menu, Segment, Grid } from 'semantic-ui-react'
import moment from 'moment'
import 'react-datepicker/dist/react-datepicker.css'
import ReCAPTCHA from 'react-google-recaptcha'
import PersonalInfo from './FormShared/PersonalInfo'
import FamilyDetails from './FormShared/FamilyDetails'
import Office from './FormShared/Office'
const recaptchaRef = React.createRef()

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
  fatherContactNumber: undefined,
  fatherEmail: '',
  fatherOccupation: '',
  fatherIncome: undefined,

  motherName: '',
  motherIcNumber: '',
  motherNationality: '',
  motherContactNumber: undefined,
  motherEmail: '',
  motherOccupation: '',
  motherIncome: undefined,

  otherFamily: [], // each object {name, relationship, age}
  fas: [],
  fscName: '',
  tuition: [],
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

  /* Terms and conditions */
  terms: false,
  termsDetails: false,

  tuitionChoices: {
    Cdac: false,
    Mendaki: false,
    Private: false
  },

  error: [],
  activeItem: 'Personal Info',
  captchaCode: ''
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
        error: 'Timeout, please review and accept the terms again.'
      }
    default:
      return state
  }
}

const StudentForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { profile, misc, admin, terms, termsDetails, error, activeItem } = state
  const { academicInfo } = misc

  const handleChange = (e, { name, value, checked }) => {
    const nameArr = name.split('-') // ['father', 'name']
    const [parentProp, childProp] = nameArr
    let newParent
    if (childProp) {
      newParent = {
        ...parentProp,
        [childProp]: value
      }
    } else {
      newParent = value || checked
    }
    dispatch({type: 'updateField', name: parentProp, value: newParent})
  }

  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <Menu attached='top' pointing fluid stackable>
            <Menu.Item name='Personal Info' active={activeItem === 'Personal Info'} onClick={dispatch({type: 'changeActive', name: 'Personal Info'})} color={'red'}><Icon name='user' />1. Personal Info</Menu.Item>
            <Menu.Item name='Family Details' active={activeItem === 'Family Details'} onClick={dispatch({type: 'changeActive', name: 'Family Details'})} color={'blue'}><Icon name='info circle' />2. Family Info</Menu.Item>
            <Menu.Item name='For office use' active={activeItem === 'office'} onClick={dispatch({type: 'changeActive', name: 'office'})} color={'orange'}><Icon name='dashboard' />3. For office use</Menu.Item>
          </Menu>
        </Grid.Column>
      </Grid.Row>
      {/* The form only renders part of the form accordingly to the tab selected
        Most of the fields have names of '(parent)-(child)'. This is such that they can be separated easily by the hyphen
        and will be edited accoringly. */}
      <Grid.Row>
        <Grid.Column>
          <Form onSubmit={handleSubmit}>
            { activeItem === 'Personal Info' &&
            <PersonalInfo profile={profile} academicInfo={academicInfo} dispatch={dispatch} handleChange={handleChange} />
            }
            { activeItem === 'Family Details' &&
              <FamilyDetails state={state} dispatch={dispatch} handleChange={handleChange} />
            }
            { activeItem === 'office' &&
              <Office admin={admin} dispatch={dispatch} handleChange={handleChange} />
            }

            {/* terms and conditions */}
            <Form.Checkbox label={<label onClick={() => {
              recaptchaRef.current.execute()
              dispatch({type: 'handleTermsOpen'})
            }}>I agree to the Terms and Conditions</label>} name='terms' required checked={terms} />
            <Modal open={termsDetails} onClose={this.close} dimmer='blurring' size='large'>
              <Modal.Header>Terms and conditions</Modal.Header>
              <Modal.Content scrolling>
                <Modal.Description>
                  <Header>Welcome to Ulu Pandan STARS</Header>
                  <p>Thanks for choosing Ulu Pandan STARS. This service is provided by Ulu Pandan STARS (&quot;UP STARS&quot;), located at Block 3 Ghim Moh Road, Singapore.
                By signing up as a student, you are agreeing to these terms. <b>Please read them carefully.</b></p>
                  <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary 3 / Junior Colleges with primary
                  or lower secondary students who need assistance with academic subjects but lack the funding to secure help. </p>
                  <p>2. Students are expected to care about their learning outcomes and behaviour, attend the tuition sessions punctually and regularly. In the event that the student will be absent from tuition, or unable to make it on time,
                  he/she should inform fellow tutors or relevant personnel(s) in advance. The programme organizer reserves the right to request the Student to leave the programme in the event that he/she exhibits inappropriate behaviour(s). </p>
                  <p>3. Students are required to achieve a minimum of 80% attendance within the period of tuition.</p>
                  <p>4. The programme organizer reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
                  <p>5. Users provide their real names and information, and we need your help to keep it that way. Here are some commitments you make to us relating to registering and maintaining the security of your account:</p>
                  <p>&emsp; a. You will not provide any false personal information, or create an account for anyone other than yourself without permission.</p>
                  <p>&emsp; b. You will not create more than one personal account.</p>
                  <p>&emsp; c. If we disable your account, you will not create another one without our permission.</p>
                  <p>&emsp; d. To the best of my knowledge, the information contained herein is accurate and reliable as of the date of submission.</p>
                  <p>6. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
                  You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.</p>
                  <p>7. When accessing or using our Services, you will not:</p>
                  <p>&emsp; a. Attempt to gain unauthorized access to another user’s Account or to the Services (or to other computer systems or networks connected to or used together with the Services)</p>
                  <p>&emsp; b. Upload, transmit, or distribute to or through the Services any computer viruses, worms, or other software intended to interfere with the intended operation of a computer system or data</p>
                  <p>8. PDPA Singapore. Consent to provide Personal Data. By indicating your consent to provide your personal data in this form, you agree to receive updates and important announcements from UP STARS by email and phone. You also agree to
               allow your personal information to be passed to anyone related to UP STARS. All personal information will be kept confidential and used for the purpose(s) required for the operation of UP STARS only.</p>
                  <Header>Revisions</Header>
                  <p>Last modified: 1st February, 2019</p>
                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button negative icon='close' labelPosition='right' content='I DISAGREE' onClick={() => dispatch({type: 'handleTermsDisagree'})} />
                <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={() => dispatch({type: 'handleTermsClose'})} />
              </Modal.Actions>
            </Modal>
            <Message
              hidden={error.length === 0}
              negative
              content={error}
            />
            <Form.Button type='submit'>Add student</Form.Button>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='invisible'
              sitekey='6LdCS1IUAAAAAHaYU_yJyFimpPuJShH-i80kFj3F' // Dev key under Ying Keat's account (yingkeatwon@gmail.com)
              onChange={() => dispatch({type: 'captchaChange'})}
              onExpired={() => dispatch({type: 'captchaExpired'})}
            />
          </Form>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default StudentForm

// checkRequired = (checkArray) => {
//   const error = []
//   for (let i of checkArray) {
//     const iArr = i.split('-')
//     const parentProp = iArr[0]
//     const childProp = iArr[1]
//     const item = childProp ? this.state[parentProp][childProp] : this.state[parentProp]
//     if (!item || item === '') error.push(i)
//   }
//   return error // array of uncompleted required fields
// }

// handleChange = (e, { name, value, checked }) => {
//   const nameArr = name.split('-') // ['father', 'name']
//   const parentProp = nameArr[0]
//   const childProp = nameArr[1]
//   if (childProp) {
//     this.setState({
//       [parentProp]: {
//         ...this.state[parentProp],
//         [childProp]: value || checked
//       }
//     })
//   } else {
//     this.setState({ [parentProp]: value || checked })
//   }
// }

// handleDateChange = (dateType) => (date) => {
//   const dateTypeArr = dateType.split('-')
//   const parentProp = dateTypeArr[0]
//   const childProp = dateTypeArr[1]
//   this.setState({
//     [parentProp]: {
//       ...this.state[parentProp],
//       [childProp]: date
//     }
//   })
// }

// showSuccess = (studentId) => {
//   this.context.router.history.push(`/dashboard/students/edit/${studentId}`)
// }

// handleSubmit = async e => {
//   e.preventDefault()
//   /* submit inputs in fields (stored in state) */
//   const { profile, father, mother, otherFamily, misc, admin, tuitionChoices, captchaCode } = this.state
//   const { addStudent } = this.props

//   // check required fields
//   let error = this.checkRequired(['profile-name', 'profile-icNumber', 'profile-dob', 'profile-nationality', 'profile-gender', 'profile-address', 'terms'])

//   if (error.length === 0) {
//   // Do some wizardry to format data here
//     let studentDataToSubmit = {
//       profile, father, mother, otherFamily, misc, admin
//     }
//     // Simply put: Take the keys of tuitonChoices (CDAC, Mendaki, Private) and reduce it
//     // if the current value is true, that choice (known as current) would be added to the list of total choices (known as last)
//     // else if that option is not checked (false), the list will remain the same (nothing added)
//     const tuition = Object.keys(tuitionChoices).reduce((last, current) => (tuitionChoices[current] ? last.concat(current) : last
//     ), [])

//     studentDataToSubmit.misc = {...studentDataToSubmit.misc, tuition} // adding tuition info into misc
//     studentDataToSubmit.captchaCode = captchaCode

//     try {
//       let submittedData = await addStudent(studentDataToSubmit)
//       // Populate the field so that the user can click the button to proceed to the page.
//       this.showSuccess(submittedData)
//     } catch (err) {
//       this.setState({serverError: err.response.data.error})
//     }
//   } else { // incomplete Field
//     console.log('Incomplete Fields')
//     error = error.join(', ')
//     this.setState({error})
//   }
// }

// handleTermsOpen = () => {
//   if (this.state.terms === false) this.setState({termsDetails: true})
//   else this.setState({terms: false})
// }

// handleTermsClose = () => {
//   captcha.execute()
//   if (this.state.captchaCode) this.setState({terms: true})
//   this.setState({termsDetails: false, errorMessage: ''})
// }

// handleTermsDisagree = () => this.setState({terms: false, termsDetails: false})

// // For the filling in of those fields where user can add / delete accordingly.This functions add / delete a whole row
// // The 2 fields are to be handled separately because they exists in a different state, academicInfo is nested within misc
// handleRepeatable = (option, field) => (e) => {
//   e.preventDefault()
//   if (option === 'inc') {
//     if (field === 'otherFamily') {
//       const updatingArray = this.state.otherFamily
//       updatingArray.push({
//         name: '',
//         relationship: '',
//         age: undefined
//       })
//       this.setState({otherFamily: updatingArray})
//     } else if (field === 'academicInfo') {
//       const updatingArray = this.state.misc.academicInfo
//       updatingArray.push({
//         year: undefined,
//         term: undefined,
//         english: undefined,
//         math: undefined,
//         motherTongue: undefined,
//         science: undefined,
//         overall: undefined
//       })
//       let misc = {...this.state.misc}
//       misc.academicInfo = updatingArray
//       this.setState({misc})
//     }
//   } else if (option === 'dec') { // remove last item
//     if (field === 'otherFamily') this.setState({otherFamily: this.state.otherFamily.slice(0, this.state.otherFamily.length - 1)})
//     else if (field === 'academicInfo') {
//       let misc = {...this.state.misc}
//       misc.academicInfo = misc.academicInfo.slice(0, misc.academicInfo.length - 1)
//       this.setState({misc})
//     }
//   }
// }

// handleItemClick = (e, { name }) => this.setState({ activeItem: name })

// // This is for handling the individual fields within the repeatables
// updateRepeatableChange = (index, property) => (e, {value}) => {
//   const otherFamily = this.state.otherFamily
//   otherFamily[index][property] = value
//   this.setState({otherFamily})
// }

// updateRepeatableChangeForAcademic = (index, property) => (e, {value}) => {
//   let misc = {...this.state.misc}
//   misc.academicInfo[index][property] = value
//   this.setState({misc})
// }

// // Specially added for captcha validation by Google
// captchaChange = value => {
//   this.setState({ captchaCode: value })
// }

// handleCaptchaExpired = () => {
//   this.setState({ terms: false, error: 'Timeout, please review and accept the terms again.' })
// }
