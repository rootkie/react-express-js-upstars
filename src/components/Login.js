import React, { Component } from 'react'
import { Form, Button, Header, Message } from 'semantic-ui-react'
import axios from 'axios'
import { Redirect } from 'react-router'

const initialState = {
  email: '',
  password: '',
  error: [],
  submitSuccess: false,
  errorMessage: '',
  loadingMessage: ''
}

class Login extends Component {
  state = {...initialState, redirect: false}

  constructor () {
    super()
    this.isLoggedIn()
  }

  isLoggedIn = () => {
    return axios({
      method: 'get',
      url: '/check',
      headers: {'x-access-token': localStorage.token }
    }).then((response) => {
      this.setState({ redirect: response.data.auth })
    }).catch((err) => {
      console.log(err)
    })
  }

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
      setTimeout( () => { this.setState({ loadingMessage: "Logging in..." }) }, 5000) 
      axios.post('/login', { email, password })
      .then((response) => {
        localStorage.setItem('token', response.data.token)
        this.setState({...initialState, submitSuccess: true}) // reset form
        setTimeout(() => { this.setState({submitSuccess: false}) }, 5000) // remove message
        //  Timeout as hack to prevent setState on unmounted component error
        setTimeout(() => { this.setState({ redirect: true }) }, 500) // redirect to homepage if login successful
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
    const { email, password, error, errorMessage, loadingMessage, submitSuccess, redirect } = this.state

    if (redirect) {
      return <Redirect push to='/home' />
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
          <Message
            hidden={loadingMessage === ''}
            positive
            content={loadingMessage}
          />
        </div>
      </div>
    )
  }
}

export default Login
