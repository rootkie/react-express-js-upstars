import React, { Component } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

const initialState = {
  email: '',
  password: '',
  message: ''
}

class Login extends Component {
  state = {...initialState, redirect: false}

  // Before the page starts to render
  constructor () {
    super()
    this.isLoggedIn()
  }

  // Call the API to check the validity of the token if any. The token is sent as the header to check and would be undefined if user
  // has yet to log in. Will implement the refresh token scheme later after the main functions of the software is done.
  isLoggedIn = () => {
    return axios({
      method: 'get',
      url: '/check',
      headers: { 'x-access-token': window.localStorage.token }
    }).then(response => {
      this.setState({ redirect: response.data.auth })
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
        axios.defaults.headers.common['x-access-token'] = window.localStorage.token
        this.setState({ redirect: true })
      })
      // Errors are catched. Axios defaults all errors to http codes !== 2xx
      .catch(error => {
        console.log(error)
        this.setState({message: error.response.data.error})
      })
  }

  render () {
    const { email, password, message, redirect } = this.state

    if (redirect) {
      return <Redirect to='/home' />
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
            <Image size='big' fluid centered src={require('./logo.png')} />
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
                <Message
                  hidden={message === ''}
                  negative
                  content={message}
                />
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
