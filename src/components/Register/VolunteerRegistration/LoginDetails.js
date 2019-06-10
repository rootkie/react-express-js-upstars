import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const LoginDetails = ({ state, handleChange }) => {
  const { email, password, passwordcfm } = state
  return (
    <Segment attached='bottom' color='red'>
      <Form.Input label='Email' placeholder='Email' name='email' value={email} onChange={handleChange} required type='email' />
      <Form.Group widths='equal'>
        <Form.Input label='Password' placeholder='Password' name='password' value={password} onChange={handleChange} required type='password' />
        <Form.Input label='Confirm Password' placeholder='Confirm Password' name='passwordcfm' value={passwordcfm} onChange={handleChange} required type='password' />
      </Form.Group>
    </Segment>
  )
}

LoginDetails.propTypes = {
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}
export default LoginDetails
