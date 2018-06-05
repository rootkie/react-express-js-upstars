import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Container, Grid, Dimmer, Loader } from 'semantic-ui-react'
import axios from 'axios'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import ClassWrap from './Class/ClassWrap'
import Home from './Home'
import { object } from 'prop-types'
import VolunteerWrap from './Volunteer/VolunteerWrap'
import AttendanceWrap from './Attendance/AttendanceWrap'
import StudentWrap from './Student/StudentWrap'
import AdminWrap from './Admin/AdminWrap'
import FourZeroThree from './Error/403'
import FourZeroFour from './Error/404'
import FiveHundred from './Error/500'

// axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'
axios.defaults.baseURL = 'http://127.0.0.1:1444/api/'
axios.defaults.headers.common['x-access-token'] = window.localStorage.token
axios.defaults.headers.post['Content-Type'] = 'application/json'

const GridStyle = {
  paddingTop: '4em',
  height: '100vh',
  overflow: 'none',
  margin: '0'
}

const MainContentStyle = {
  overflow: 'auto'
}

let forceRefresh

class MainCtrl extends Component {
  static propTypes = {
    match: object
  }

  state = {
    isLoggedIn: true,
    confirm: false,
    name: '',
    id: '',
    errorCode: false
  }

  isLoggedIn = () => {
    axios.get('/check')
      .then(response => {
        // If expired or malformed, we check if refresh token is available (refresh token is king)
        // If it is, send it in to get a new x-access-token (a faulty refresh token will return an empty string as access token)
        // isLoggedIn() is then called again to ensure access token is valid
        // Else if there are any errors anywhere regardless, default auth is false.
        if (response.data.auth === false) {
          let refreshToken = window.localStorage.refreshToken
          if (!refreshToken) {
            // Redirect them to Login Page if they don't even if a refresh token.
            this.setState({ isLoggedIn: false })
          } else {
            axios.post('/refresh', { refreshToken })
              .then(response => {
                if (response.data.status === true) {
                  window.localStorage.setItem('token', response.data.token)
                  axios.defaults.headers.common['x-access-token'] = response.data.token
                  this.isLoggedIn()
                } else {
                  // Well if refresh token is invalid, remove both to make stuff easier and redirect them to Login.
                  window.localStorage.removeItem('token')
                  window.localStorage.removeItem('refreshToken')
                  this.setState({ isLoggedIn: false })
                }
              })
              .catch(err => {
                console.log(err)
                this.setState({ isLoggedIn: false })
              })
          }
        }
        if (response.data.auth === true) {
          let { name, _id, roles } = response.data
          this.setState({ name, _id, roles, confirm: true })
        }
        // Silently change access token in the background, everything will continue. Even if refresh is invalid, simply ignore.
        // Since MainCtrl checks the expiry, there will be no expiry checks in Login.
        if (response.data.auth === 'expiring') {
          let { name, _id, roles } = response.data
          this.setState({ name, _id, roles, confirm: true })
          let refreshToken = window.localStorage.refreshToken
          if (refreshToken) {
            axios.post('/refresh', { refreshToken })
              .then(response => {
                if (response.data.status === true) {
                  window.localStorage.setItem('token', response.data.token)
                  axios.defaults.headers.common['x-access-token'] = response.data.token
                }
              })
              .catch(err => {
                console.log(err)
                this.setState({ isLoggedIn: false })
              })
          }
        }
      }).catch((err) => {
        this.setState({ isLoggedIn: false })
        console.log(err)
      })
  }

  constructor (props) {
    super()
    this.isLoggedIn()
    forceRefresh = window.setInterval(this.changeState, 600000)
    axios.interceptors.response.use(response => {
      return response
    }, error => {
      if (error.response.status === 500 || error.response.status === 404 || error.response.status === 403) {
        let errorCode = error.response.status
        this.setState({errorCode})
        return Promise.reject(error)
      } else {
        return true
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    window.clearInterval(forceRefresh)
    // Force confirm state of "confirm" every 10 minutes so there wont be issues that the main() renders after token expire
    // While the state of "confirm" is still true as the user afk for 30 minutes. (Token will be refreshed but calls are made with old tokens)
    this.isLoggedIn()
    forceRefresh = window.setInterval(this.changeState, 600000)
  }

  componentWillUnmount () {
    window.clearInterval(forceRefresh)
  }

  changeState = () => {
    this.isLoggedIn()
  }

  render () {
    const { main, op, sid } = this.props.match.params || ''
    const { name, _id, roles, errorCode } = this.state

    if (!this.state.isLoggedIn) {
      return <Redirect to='/login' />
    }

    if (errorCode === 403) {
      return (
        <FourZeroThree />
      )
    }
    if (errorCode === 404) {
      return (
        <FourZeroFour />
      )
    }
    if (errorCode === 500) {
      return (
        <FiveHundred />
      )
    } else if (this.state.isLoggedIn && this.state.confirm) {
      return (
        <Container fluid>
          <Topbar tab={main} name={name} _id={_id} />
          <Grid style={GridStyle}>
            <SideMenu activeItem={main + op || ''} roles={roles} />
            <Grid.Column width={13} style={MainContentStyle}>
              {main === 'home' && <Home />}
              {main === 'students' && <StudentWrap op={op} sid={sid} roles={roles} />}
              {main === 'classes' && <ClassWrap op={op} sid={sid} roles={roles} />}
              {main === 'volunteer' && <VolunteerWrap op={op} sid={sid} _id={_id} roles={roles} />}
              {main === 'attendance' && <AttendanceWrap op={op} sid={sid} roles={roles} />}
              {main === 'admin' && <AdminWrap op={op} />}
            </Grid.Column>
          </Grid>
        </Container>
      )
    } else {
      return (
        <Dimmer active>
          <Loader>Loading</Loader>
        </Dimmer>
      )
    }
  }
}

export default MainCtrl
