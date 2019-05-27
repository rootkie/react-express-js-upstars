import React, { useReducer, useEffect } from 'react'
import { Header, Message, Image, Grid, Icon } from 'semantic-ui-react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const initialState = {
  success: false,
  error: false
}

const heightStyle = { height: '100%' }
const maxWidth = { maxWidth: 550 }
const image = require('./logo.png')

const verifyEmail = (dispatch, match) => {
  let { token } = match.params
  axios.post(`/verifyEmail`, { token })
    .then(response => {
      dispatch({type: 'verificationSuccess'})
    }).catch(err => {
      dispatch({type: 'verificationFailure', err})
    })
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'verificationSuccess':
      return {
        ...state,
        success: true
      }
    case 'verificationFailure':
      return {
        ...state,
        error: true
      }
    default:
      return state
  }
}

const EmailVerify = ({match}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    verifyEmail(dispatch, match)
  }, [match.params.token])

  const { success, error } = state

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
        style={heightStyle}
        verticalAlign='middle'>
        <Grid.Column style={maxWidth}>
          <Image size='big' centered src={image} />
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

EmailVerify.propTypes = {
  match: PropTypes.object.isRequired
}

export default EmailVerify
