import React, { Component } from 'react'
import { Form, Button, Header, Message, Image, Segment, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { object } from 'prop-types'
import { NavLink } from 'react-router-dom'

const initialState = {
  password: '',
  confirmPassword: '',
  message: '',
  success: false
}

class ResetPassword extends Component {
  state = {...initialState}
  static propTypes = {
    match: object
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
    const { confirmPassword, password, message, success } = this.state

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
