import React, { Component } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { Link, Redirect } from 'react-router-dom'

const initialState = {
  email: '',
  nric: '',
  message: ''
}

class ForgetPassword extends Component {
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
    const { email, nric } = this.state
    this.setState({ message: 'Processing in progress...' })
    axios.post('/changepassword', { email, nric })
      .then(response => {
        this.setState({ message: 'A password reset link has been sent to your email. Please allow for 5 minutes before requesting for a new link if you did not receive any email.' })
      })
      // Errors are catched. Axios defaults all errors to http codes !== 2xx
      .catch(error => {
        console.log(error)
        this.setState({message: error.response.data.error})
      })
  }

  render () {
    const { email, nric, message, redirect } = this.state

    if (redirect) {
      return <Redirect to='/home' />
    }

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
              Reset your account password
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  icon='mail'
                  iconPosition='left'
                  placeholder='E-mail address'
                  name='email' value={email} type='email' onChange={this.handleChange} required />
                <Form.Input
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='NRIC number'
                  type='text' name='nric' value={nric} onChange={this.handleChange} required />

                <Button color='teal' fluid size='large' type='submit'>Request for password reset</Button>
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
}

export default ForgetPassword
