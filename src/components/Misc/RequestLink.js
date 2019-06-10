import React, { useReducer } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const initialState = {
  email: '',
  nric: '',
  message: ''
}

const heightStyle = { height: '100%' }
const maxWidth = { maxWidth: 550 }
const image = require('./logo.png')

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'error':
      return {
        ...state,
        message: action.message
      }
    case 'success':
      return {
        ...initialState,
        message: action.message
      }
    default:
      return state
  }
}

const RequestLink = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleChange = (e, { name, value }) => {
    dispatch({ type: 'updateField', name, value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const { email, nric } = state
    dispatch({ type: 'updateField', name: 'message', value: 'Processing in progress...' })
    axios.post('/link', { email, nric })
      .then(response => {
        dispatch({ type: 'success', message: 'Your request has been successful. If the details match, an email will be sent to you.' })
      })
      .catch(error => {
        if (error.response.data.error) {
          dispatch({ type: 'error', message: error.response.data.error })
        } else {
          dispatch({ type: 'error', message: 'There is something wrong. Please try again!' })
        }
      })
  }

  const { email, nric, message } = state

  return (
    <div className='requestlink-form'>
      <style>{`
          body > div,
          body > div > div,
          body > div > div > div.requestlink-form {
            height: 100%;
          }
    `}</style>
      <Grid
        textAlign='center'
        style={heightStyle}
        verticalAlign='middle'>
        <Grid.Column style={maxWidth}>
          <Image size='big' centered src={image} />
          <Header as='h2' color='teal' textAlign='center'>
              Request for new email verification link
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='mail'
                iconPosition='left'
                placeholder='E-mail address'
                name='email' value={email} type='email' onChange={handleChange} required />
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder='NRIC number'
                type='text' name='nric' value={nric} onChange={handleChange} required />

              <Button color='teal' fluid size='large' type='submit'>Request for new link</Button>
              <Message hidden={message === ''} negative>
                {message}
              </Message>
            </Segment>
          </Form>
          <Message>
          New to us? <Link to='/register/volunteer'>Sign Up</Link>
          </Message>
        </Grid.Column>
      </Grid>
    </div>
  )
}

export default RequestLink
