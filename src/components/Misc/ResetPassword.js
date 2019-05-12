import React, { useReducer } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

const initialState = {
  password: '',
  confirmPassword: '',
  message: '',
  success: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'success':
      return {
        ...initialState,
        message: action.message,
        success: true
      }
    case 'error':
      return {
        ...state,
        message: action.message,
        success: false
      }
    default:
      return state
  }
}

const ResetPassword = ({match}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleChange = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value})
  }

  const handleSubmit = e => {
    e.preventDefault()
    const { password, confirmPassword } = state
    const { token } = match.params
    if (password !== confirmPassword) {
      dispatch({type: 'error', message: 'The 2 passwords do not match, please try again.'})
      return
    }

    dispatch({ type: 'updateField', value: 'Resetting password...', name: 'message' })
    axios.post('/resetpassword', { password, token })
      .then(response => {
        dispatch({type: 'success', message: 'Your password has been successfully reset. Please proceed to log-in'})
      })
      .catch(error => {
        if (error.response.data.error) dispatch({type: 'error', message: error.response.data.error})
        else dispatch({type: 'error', message: 'Something went wrong, please try again.'})
      })
  }
  const { confirmPassword, password, message, success } = state

  return (
    <div className='resetpassword-form'>
      <style>{`
          body > div,
          body > div > div,
          body > div > div > div.resetpassword-form {
            height: 100%;
          }
    `}</style>
      <Grid
        textAlign='center'
        style={{ height: '100%' }}
        verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 550 }}>
          <Image size='big' centered src={require('./logo.png')} />
          <Header as='h2' color='teal' textAlign='center'>
              Reset your password
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                name='password' value={password} type='password' onChange={handleChange} required />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Confirm Password'
                type='password' name='confirmPassword' value={confirmPassword} onChange={handleChange} required />

              <Button color='teal' fluid size='large' type='submit'>Reset password</Button>
              <Message hidden={message === ''}negative>
                {message}
              </Message>
              <Message hidden={success === false}><NavLink to='/login'>Login now!</NavLink>
              </Message>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    </div>
  )
}

ResetPassword.propTypes = {
  match: PropTypes.object.isRequired
}

export default ResetPassword
