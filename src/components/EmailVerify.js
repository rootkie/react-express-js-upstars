import React, { Component } from 'react'
import { Header, Message, Image, Grid, Icon } from 'semantic-ui-react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const initialState = {
  success: false,
  error: false
}

class EmailVerify extends Component {
  state = {...initialState}
  // Before the page starts to render
  constructor (props) {
    super(props)
    this.verifyEmail(props)
  }

verifyEmail = (props) => {
  let { token } = props.match.params
  axios.post(`/verifyEmail`, { token })
    .then(response => {
      this.setState({ success: true })
    }).catch((err) => {
      console.log(err)
      this.setState({ error: true })
    })
}

render () {
  const { success, error } = this.state

  return (
    <div className='verify-form'>
      <style>{`
          body > div,
          body > div > div,
          body > div > div > div.verify-form {
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
              Verify your email
          </Header>
          <Message icon hidden={success === true || error === true}>
            <Icon name='circle notched' loading />
            <Message.Content>
              <Message.Header>Just one second</Message.Header>
                We are confirming the email verification
            </Message.Content>
          </Message>
          <Message positive hidden={success === false}>Email verified! <Link to='/login'>Proceed to Log In</Link></Message>
          <Message negative hidden={error === false}>There is an error, please try again.</Message>
        </Grid.Column>
      </Grid>
    </div>
  )
}
}

export default EmailVerify
