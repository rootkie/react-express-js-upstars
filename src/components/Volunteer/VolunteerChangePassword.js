import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Header, Message, Image, Segment, Grid, Icon } from 'semantic-ui-react'
import axios from 'axios'

const initialState = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  message: ''
}

class VolunteerChangePassword extends Component {
    static propTypes = {
      _id: PropTypes.string
    }

  state = {...initialState}

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = e => {
    e.preventDefault()
    const { oldPassword, newPassword, confirmNewPassword } = this.state
    const userId = this.props._id
    if (newPassword !== confirmNewPassword) {
      this.setState({ message: 'Passwords do not match! Please try again.' })
      return
    }
    // Set the message and attempts to log in
    this.setState({ message: 'Changing password in progress...' })
    axios.post('/users/changePassword', { oldPassword, newPassword, userId })
      .then(response => {
        this.setState({ message: 'Your password has been changed successfully!', ...initialState })
      })
      // Errors are catched. Axios defaults all errors to http codes !== 2xx
      .catch(error => {
        console.log(error)
        this.setState({message: error.response.data.error})
      })
  }

  render () {
    const { oldPassword, newPassword, confirmNewPassword, message } = this.state

    return (
      <div className='change-password'>
        <style>{`
          body > div,
          body > div > div,
          body > div > div > div.change-password {
            height: 100%;
          }
    `}</style>
        <Grid
          textAlign='center'
          style={{ height: '100%' }}
          verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 700 }}>
            <Image size='medium' centered src={require('./../Misc/logo.png')} />
            <Header as='h2' color='teal' textAlign='center'>
              Change User Password
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  icon='unlock alternate'
                  iconPosition='left'
                  placeholder='Current Password'
                  name='oldPassword' value={oldPassword} type='password' onChange={this.handleChange} required />
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='New Password'
                  type='password' name='newPassword' value={newPassword} onChange={this.handleChange} required />
                <Form.Input
                  fluid
                  icon={<Icon name='lock' color='green' />}
                  iconPosition='left'
                  placeholder='Confirm New Password'
                  type='password' name='confirmNewPassword' value={confirmNewPassword} onChange={this.handleChange} required />

                <Button color='teal' fluid size='large' type='submit'>Change Password</Button>
                <Message
                  hidden={message === ''}
                  negative
                  content={message}
                />
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default VolunteerChangePassword
