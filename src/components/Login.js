import React, { Component } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid, Dimmer, Loader } from 'semantic-ui-react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

const initialState = {
  email: '',
  password: '',
  message: '',
  isLoading: true
}

class Login extends Component {
  state = {...initialState, redirect: false}

  // Before the page starts to render
  constructor () {
    super()
    this.isLoggedIn()
  }

  isLoggedIn () {
    return axios({
      method: 'get',
      url: '/check',
      headers: { 'x-access-token': window.localStorage.token }
    }).then(response => {
      // Send in refresh token first before anything else
      if (response.data.auth === false) {
        let refreshToken = window.localStorage.refreshToken
        if (!refreshToken) {
          // Cleaning up the interface
          window.localStorage.removeItem('token')
          this.setState({ isLoading: false })
        } else {
          axios.post('/refresh', { refreshToken })
            .then(response => {
              if (response.data.status === true) {
                window.localStorage.setItem('token', response.data.token)
                axios.defaults.headers.common['x-access-token'] = response.data.token
                this.isLoggedIn()
              } else {
                // Well if refresh token is invalid, remove both to make stuff easier and let them Login.
                // Anything that happens during the POST request will simply be made for them to login
                window.localStorage.removeItem('token')
                window.localStorage.removeItem('refreshToken')
                this.setState({ isLoading: false })
              }
            })
            .catch(err => {
              console.log(err)
              this.setState({ isLoading: false })
            })
        }
      } else {
        // Expiring means token is still valid, leave the refresh process to MainCtrl. Either way, redirect is true
        this.setState({ redirect: true })
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = e => {
    e.preventDefault()
    const { email, password } = this.state

    // Set the message and attempts to log in
    this.setState({ message: 'Logging in...' })
    axios.post('/login', { email, password })
      .then(response => {
        window.localStorage.setItem('token', response.data.token)
        window.localStorage.setItem('refreshToken', response.data.refresh)
        axios.defaults.headers.common['x-access-token'] = window.localStorage.token
        this.setState({ redirect: true })
      })
      .catch(error => {
        console.log(error.response)
        this.setState({message: error.response.data.error})
      })
  }

  render () {
    const { email, password, message, redirect, isLoading } = this.state

    if (redirect) {
      return <Redirect to='/dashboard/home' />
    }
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
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
            <Image size='big' centered src={require('./logo.png')} />
            <Header as='h2' color='teal' textAlign='center'>
              Log-in to your account
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='E-mail address'
                  name='email' value={email} type='email' onChange={this.handleChange} required />
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password' name='password' value={password} onChange={this.handleChange} required />

                <Button color='teal' fluid size='large' type='submit'>Login</Button>
                <Message hidden={message === ''} negative>
                  {message}.<Link to='/forgetpassword'> Forget password?</Link>
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
}

export default Login
