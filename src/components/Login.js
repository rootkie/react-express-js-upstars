import React, { Component } from 'react'
import { Form, Button, Header, Message } from 'semantic-ui-react'
import axios from 'axios'
import { Redirect } from 'react-router'

const rootkiddie = axios.create({
  baseURL: 'https://test.rootkiddie.com/api/',
  headers: {'Content-Type': 'application/json'}
})

const initialState = {
  email: '',
  password: '',
  error: [],
  submitSuccess: false,
  errorMessage: ''
}

class Login extends Component {
  state = {...initialState, redirect: false}

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

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
    const { email, password } = this.state
    // check required fields
    const error = this.checkRequired(['email', 'password'])

    if (error.length === 0) {
      rootkiddie.post('/login', { email, password })
      .then((response) => {
        console.log(response)
        console.log(response.data.token) // ***should be stored somewhere***
        this.setState({...initialState, submitSuccess: true}) // reset form
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
        this.setState({ redirect: true }) // redirect to homepage if login successful
      })
      .catch((error) => {
        console.log(error)
        this.setState({errorMessage: error.response.data.error})
      })
    } else { // incomplete required fields
      console.log('error occured')
      this.setState({error, errorMessage: 'Please Check Required Fields!'})
    }
  }

  render () {
    const { email, password, error, errorMessage, submitSuccess, redirect } = this.state

    if (redirect) {
      return <Redirect to='/home' />
    }

    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
        <Form onSubmit={this.handleSubmit} style={{padding: '20px', borderColor: 'darkcyan', borderRadius: '5px', borderStyle: 'solid'}}>
          <Form.Input label='Email' placeholder='email' name='email' value={email} type='email' onChange={this.handleChange} required />
          <Form.Input label='Password' placeholder='password' name='password' value={password} type='password' onChange={this.handleChange} required />
          <Button type='submit' positive >Login</Button>
        </Form>
        <div>
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

export default Login
