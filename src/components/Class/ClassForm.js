import React, { useReducer } from 'react'
import { Form, Message, Header, Grid } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router-dom'
import 'react-datepicker/dist/react-datepicker.css'

// Init typeOptions to be used in dropdown for TYPE of class
const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const initialState = {
  className: '',
  classType: 'Tuition',
  venue: '',
  dayAndTime: '',
  classId: '',
  startDate: moment(),
  submitSuccess: false,
  errorMessage: ''
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'updateDate':
      const {startDate} = action
      return {
        ...state,
        startDate
      }
    case 'submitSuccess':
      return {
        ...initialState,
        submitSuccess: true,
        classId: action.newClassId
      }
    case 'closeMessage':
      return {
        ...state,
        submitSuccess: false
      }
    case 'handleError':
      return {
        ...state,
        errorMessage: action.message
      }
    default:
      return state
  }
}

const handleSubmit = (state, dispatch, addClass) => async e => {
  e.preventDefault()
  const { className, classType, venue, dayAndTime, startDate } = state
  const data = {
    className,
    classType,
    venue,
    dayAndTime: dayAndTime === 'Enrichment' ? 'nil' : dayAndTime,
    startDate
  }

  try {
    const newClassId = await addClass(data)
    // Reset the form back to the initial state. This also populates the classID so that the user can click on the link to be directed immediately.
    dispatch({type: 'submitSuccess', newClassId})
  } catch (err) {
    console.log(err.response)
    dispatch({type: 'handleError', message: err.response.data.error})
  }
}

const ClassForm = ({addClass}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleChange = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value})
  }

  const handleDateChange = (startDate) => {
    dispatch({type: 'updateDate', startDate})
  }

  const closeMessage = () => {
    dispatch({type: 'closeMessage'})
  }

  const { className, classType, venue, dayAndTime, submitSuccess, classId, errorMessage, startDate } = state
  return (
    <Grid stackable stretched>
      {submitSuccess &&
        <Grid.Row>
          <Grid.Column>
            <Message positive onDismiss={closeMessage}>Class created. <Link to={'id/' + classId}>Click here to view it.</Link></Message>
          </Grid.Column>
        </Grid.Row>
      }
      {errorMessage.length !== 0 &&
      <Grid.Row>
        <Grid.Column>
          <Message
            icon='exclamation triangle'
            header='Error!'
            negative
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
          <Form onSubmit={handleSubmit(state, dispatch, addClass)}>
            <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={className} onChange={handleChange} required />
            <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={classType} onChange={handleChange} required />
            <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={handleChange} required />
            <Form.Field required>
              <label>Starting Date</label>
              <DatePicker
                inline
                fixedHeight
                showMonthDropdown
                dropdownMode='select'
                dateFormat='DD/MM/YYYY'
                selected={startDate}
                onChange={handleDateChange} required />
            </Form.Field>
            <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={handleChange} disabled={classType === 'Enrichment'} required={classType === 'Tuition'} />
            <Form.Button>Submit</Form.Button>
          </Form>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

ClassForm.propTypes = {
  addClass: PropTypes.func.isRequired
}

export default ClassForm
