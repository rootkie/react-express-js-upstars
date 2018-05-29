import React, { Component } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { object } from 'prop-types'
import { Redirect, NavLink } from 'react-router-dom'

const initialState = {
  password: '',
  confirmPassword: '',
  message: '',
  success: false
}

class ResetPassword extends Component {
  state = {...initialState, redirect: false}
  static propTypes = {
    match: object
  }
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
    const { password, confirmPassword } = this.state
    const { token } = this.props.match.params
    if (password !== confirmPassword) {
      this.setState({ message: 'The 2 passwords do not match, please try again.' })
      return
    }

    this.setState({ message: 'Resetting password...' })
    axios.post('/resetpassword', { password, token })
      .then(response => {
        this.setState({message: 'Your password has been successfully reset. Please proceed to log-in', success: true})
      })
      // Errors are catched. Axios defaults all errors to http codes !== 2xx
      .catch(error => {
        console.log(error)
        this.setState({message: error.response.data.error})
      })
  }

  render () {
    const { confirmPassword, password, message, redirect, success } = this.state

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
              Reset your password
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  name='password' value={password} type='password' onChange={this.handleChange} required />
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Confirm Password'
                  type='password' name='confirmPassword' value={confirmPassword} onChange={this.handleChange} required />

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
}

export default ResetPassword
