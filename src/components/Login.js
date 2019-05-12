import React, { useReducer, useEffect } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid, Dimmer, Loader } from 'semantic-ui-react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

const initialState = {
  email: '',
  password: '',
  message: '',
  isLoading: true,
  redirect: false,
  showLink: false
}

/*
=======================================================
Functions required in the main body
=======================================================
*/

const isLoggedIn = async (dispatch) => {
  try {
    const response = await axios({
      method: 'get',
      url: '/check',
      headers: { 'x-access-token': window.localStorage.token }
    })
    const authStatus = response.data.auth
    if (authStatus === false) {
      const refreshToken = window.localStorage.refreshToken
      if (!refreshToken) {
        // Cleaning up the interface
        window.localStorage.removeItem('token')
        dispatch({type: 'stopLoading'})
      } else {
        let newAccessToken = await axios.post('/refresh', { refreshToken })
        if (newAccessToken.data.status === true) {
          window.localStorage.setItem('token', newAccessToken.data.token)
          axios.defaults.headers.common['x-access-token'] = newAccessToken.data.token
          isLoggedIn(dispatch)
        } else {
          // If refresh token is invalid, remove both and let them Login again to obtain valid tokens
          window.localStorage.removeItem('token')
          window.localStorage.removeItem('refreshToken')
          dispatch({type: 'stopLoading'})
        }
      }
    } else {
      // Expiring means token is still valid, leave the refresh process to MainCtrl. Either way, redirect is true
      dispatch({type: 'redirectUser'})
    }
  } catch (err) {
    dispatch({type: 'stopLoading'})
  }
}

/*
===============================================
REDUCERS
===============================================
*/
const reducer = (state, action) => {
  switch (action.type) {
    case 'stopLoading':
      return {
        ...state,
        isLoading: false
      }
    case 'redirectUser':
      return {
        ...state,
        redirect: true
      }
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'loggingIn':
      return {
        ...state,
        message: 'logging in...'
      }
    case 'showError':
      return {
        ...state,
        message: action.message
      }
    case 'showLink':
      return {
        ...state,
        showLink: true
      }
    default:
      return state
  }
}

/*
=================================================
MAIN FUNCTION
=================================================
*/
const Login = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Performs isLoggedIn() during mounting only.
  useEffect(() => {
    isLoggedIn(dispatch)
  }, [])

  /*
  =========================
  MISC FUNCTIONS
  =========================
  */

  const handleChange = (e, { name, value }) => {
    dispatch({type: 'updateField', name, value})
  }

  const handleSubmit = e => {
    e.preventDefault()
    const { email, password } = state

    // Set the message and attempts to log in
    dispatch({type: 'loggingIn'})
    axios.post('/login', { email, password })
      .then(response => {
        window.localStorage.setItem('token', response.data.token)
        window.localStorage.setItem('refreshToken', response.data.refresh)
        axios.defaults.headers.common['x-access-token'] = window.localStorage.token
        dispatch({type: 'redirectUser'})
      })
      .catch(error => {
        dispatch({type: 'showError', message: error.response.data.error})
        if (error.response.data.error === 'Your account has yet to be verified, please verify your email by checking your email account') {
          dispatch({type: 'showLink'})
        } else {
          dispatch({type: 'updateField', name: 'showLink', value: false})
        }
      })
  }

  /*
  =======================
  RENDER BODY
  =======================
  */

  const { email, password, message, redirect, isLoading, showLink } = state

  if (redirect) {
    return <Redirect to='/dashboard/home' />
  }
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading data</Loader>
      </Dimmer>
    )
  }

  return (
    <div className='login-form'>
      <style>{`
          body > div,
          body > div > div,
          body > div > div > div.login-form {
            height: 100%;
          }
    `}</style>
      <Grid
        textAlign='center'
        style={{ height: '100%' }}
        verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 550 }}>
          <Image size='big' centered src={require('./Misc/logo.png')} />
          <Header as='h2' color='teal' textAlign='center'>
              Log-in to your account
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder='E-mail address'
                name='email' value={email} type='email' onChange={handleChange} required />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password' name='password' value={password} onChange={handleChange} required />

              <Button color='teal' fluid size='large' type='submit'>Login</Button>
              <Message hidden={message === ''} negative>
                {message}.<Link to='/forgetpassword'> Forget password?</Link>
              </Message>
              <Message hidden={!showLink} positive>
                <Link to='/requestlink'>Need a new email verification link?</Link>
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

export default Login
