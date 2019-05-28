import React, { useReducer } from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Header, Message, Image, Segment, Grid, Icon } from 'semantic-ui-react'
import axios from 'axios'

const initialState = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  message: ''
}

const heightStyle = { height: '100%' }
const width = { maxWidth: 750, marginTop: 50 }
const image = require('./../Misc/logo.png')

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        [action.name]: action.value
      }
    case 'setMessage':
      return {
        ...state,
        message: action.message
      }
    case 'success':
      return {
        ...initialState,
        message: 'Your password has been changed successfully!'
      }
    default:
      return state
  }
}

const VolunteerChangePassword = ({_id}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleChange = (e, { name, value }) => dispatch({ type: 'updateField', name, value })

  const handleSubmit = e => {
    e.preventDefault()
    const { oldPassword, newPassword, confirmNewPassword } = state
    const userId = _id
    if (newPassword.length < 6) {
      dispatch({ type: 'setMessage', message: 'Please provide a password that is at least 6 characters long' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      dispatch({ type: 'setMessage', message: 'Passwords do not match! Please try again.' })
      return
    }
    dispatch({ type: 'setMessage', message: 'Changing password in progress...' })
    axios.post('/users/changePassword', { oldPassword, newPassword, userId })
      .then(response => {
        dispatch({ type: 'success' })
      })
      .catch(error => {
        dispatch({ type: 'setMessage', message: error.response.data.error })
      })
  }

  const { oldPassword, newPassword, confirmNewPassword, message } = state

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
        style={heightStyle}
        verticalAlign='middle'>
        <Grid.Column style={width}>
          <Image size='medium' centered src={image} />
          <Header as='h2' color='teal' textAlign='center'>
              Change User Password
          </Header>
          <Form size='large' onSubmit={handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon='unlock alternate'
                iconPosition='left'
                placeholder='Current Password'
                name='oldPassword' value={oldPassword} type='password' onChange={handleChange} required />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='New Password'
                type='password' name='newPassword' value={newPassword} onChange={handleChange} required />
              <Form.Input
                fluid
                icon={<Icon name='lock' color='green' />}
                iconPosition='left'
                placeholder='Confirm New Password'
                type='password' name='confirmNewPassword' value={confirmNewPassword} onChange={handleChange} required />

              <Button color='teal' fluid size='large' type='submit'>Change Password</Button>
              <Message
                hidden={message === ''}
                icon='save outline'
                content={message}
              />
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    </div>
  )
}

VolunteerChangePassword.propTypes = {
  _id: PropTypes.string
}

export default VolunteerChangePassword
