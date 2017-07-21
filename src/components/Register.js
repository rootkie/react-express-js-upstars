import React, { Component } from 'react'
import { Form, Button, Modal, Header, Message } from 'semantic-ui-react'
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {'Content-Type': 'application/json'}
})

const initialState = {
  email: '',
  password: '',
  username: '',
  error: [],
  termsDetails: false,
  submitSuccess: false,
  errorMessage: ''
}

class Register extends Component {
  state = {...initialState, terms: false}

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleTermsOpen = (e) => {
    if (this.state.terms === false) this.setState({termsDetails: true})
  }

  handleTermsClose = (e) => this.setState({termsDetails: false})

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleSubmit = e => {
    e.preventDefault()
    const { email, password, username } = this.state
    // check required fields
    const error = this.checkRequired(['email', 'password', 'email', 'terms'])

    if (error.length === 0) {
      axiosInstance.post('/simpleRegister', { email, password, username })
      .then((response) => {
        console.log(response)
        this.setState({...initialState, submitSuccess: true}) // reset form
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
      })
      .catch((error) => {
        this.setState({errorMessage: error.response.data.error})
      })
    } else { // incomplete required fields
      console.log('error occured')
      this.setState({error, errorMessage: 'Please Check Required Fields!'})
    }
  }

  render () {
    const { email, username, password, error, errorMessage, termsDetails, submitSuccess } = this.state
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <Form onSubmit={this.handleSubmit} style={{padding: '20px', borderColor: 'darkcyan', borderRadius: '5px', borderStyle: 'solid'}}>
          <Form.Input label='Email' placeholder='email' name='email' value={email} type='email' onChange={this.handleChange} required />
          <Form.Input label='Password' placeholder='password' name='password' value={password} type='password' onChange={this.handleChange} required />
          <Form.Input label='Username' placeholder='username' name='username' value={username} type='username' onChange={this.handleChange} required />
          <Button type='submit' positive >Register</Button>
          <Form.Checkbox style={{marginTop: '12px'}} label={<label onClick={this.handleTermsOpen}>I agree to the Terms and Conditions</label>} name='terms' required onChange={this.handleChange} error={error.includes('terms')} />
          <Modal open={termsDetails} onClose={this.close}>
            <Modal.Header>Terms and conditions</Modal.Header>
            <Modal.Content>
              <Modal.Description>
                <Header>Volunteer rules</Header>
                <p>Terms and conditions</p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={this.handleTermsClose} />
            </Modal.Actions>
          </Modal>
        </Form>
        <div>
          <Message
            hidden={!submitSuccess}
            success
            content='Submitted'
        />
          <Message
            hidden={error.length === 0 && errorMessage === ''}
            negative
            content={errorMessage}
        />
        </div>
      </div>
    )
  }
}

export default Register
