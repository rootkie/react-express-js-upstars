import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Container, Grid, Dimmer, Loader } from 'semantic-ui-react'
import axios from 'axios'
import Topbar from './Misc/Topbar'
import SideMenu from './Misc/SideMenu'
import ClassWrap from './Class/ClassWrap'
import Home from './Home/Home'
import { object } from 'prop-types'
import VolunteerWrap from './Volunteer/VolunteerWrap'
import AttendanceWrap from './Attendance/AttendanceWrap'
import StudentWrap from './Student/StudentWrap'
import AdminWrap from './Admin/AdminWrap'
import ErrorPage from './Error/ErrorPage'

// For development
axios.defaults.baseURL = 'http://127.0.0.1:3000/api'
// For production
// axios.defaults.baseURL = 'https://test.rootkiddie.com/api'
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
let myInterceptor

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
        // If it is, send it in to get a new x-access-token (a faulty refresh token will return null as access token)
        // isLoggedIn() is then called again to ensure access token is valid
        // Else if there are any errors anywhere, default auth is false.
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
                } else {
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
      }).catch((err) => {
        this.setState({ isLoggedIn: false })
        console.log(err)
      })
  }

  constructor () {
    super()
    this.isLoggedIn()
    this.setTimeInterval()
    // Catch all 403 /404 / 500 errors that occur in the dashboard. Login is not affected.
    myInterceptor = axios.interceptors.response.use(response => {
      return response
    }, error => {
      if (error.response.status === 500 || error.response.status === 404 || error.response.status === 403) {
        let errorCode = error.response.status
        this.setState({errorCode})
        return true
      }
      // Error catches in the local code are ignored.
      return Promise.reject(error)
    })
  }
  // Deprecated function as of React 16 and above.. > https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
  // Thus replacing componentWillReceiveProps with componentDidUpdate. Initial testing seems good to go.
  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) {
      this.clearTimeInterval()
      // Force confirm state of "confirm" every 10 minutes so there wont be issues that the main() renders after token expire
      // While the state of "confirm" is still true as the user afk for 30 minutes. (Token will be refreshed but calls are made with old tokens)
      this.isLoggedIn()
      this.setTimeInterval()
    }
  }

  componentWillUnmount () {
    // Once unmount, remove the axios interceptors so that there might not be unintended effects to other pages etc
    axios.interceptors.request.eject(myInterceptor)
    this.clearTimeInterval()
  }

  setTimeInterval = () => {
    forceRefresh = window.setInterval(this.changeState, 600000)
  }

  clearTimeInterval = () => {
    window.clearInterval(forceRefresh)
  }
  changeState = () => {
    this.isLoggedIn()
  }

  render () {
    const { path } = this.props.match
    const { name, _id, roles, errorCode, isLoggedIn } = this.state

    if (!isLoggedIn) {
      return <Redirect to='/login' />
    }

    if (errorCode === 403) {
      return (
        <ErrorPage statusCode={'403 FORBIDDEN'} errorMessage={'Your client does not have the permission to access this! That\'s all we know.'} />
      )
    }
    if (errorCode === 404) {
      return (
        <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />
      )
    }
    if (errorCode === 500) {
      return (
        <ErrorPage statusCode={'500 INTERNAL SERVER ERROR'} errorMessage={'The server encountered an error and could not complete your request. Please try again later.'} />
      )
    } else if (isLoggedIn && this.state.confirm) {
      return (
        <Container fluid>
          <Topbar name={name} _id={_id} />
          <Grid style={GridStyle} stackable>
            <SideMenu roles={roles} />
            <Grid.Column width={13} style={MainContentStyle}>
              {/* Path in this case refers to /dashboard that is inherited */}
              {/* Render is better than component for inline components: (Doesn't need to reload the DOM every time you access it (like back button))
              Refer to link - https://reacttraining.com/react-router/web/api/Route/render-func */}
              <Switch>
                <Route exact path={`${path}/home`} render={() => <Home roles={roles} />} />
                <Route exact path={`${path}/students/:op/:sid?`} render={props => <StudentWrap roles={roles} {...props} />} />
                <Route path={`${path}/classes`} render={props => <ClassWrap roles={roles} {...props} />} />
                <Route exact path={`${path}/volunteer/:op/:sid?`} render={props => <VolunteerWrap _id={_id} roles={roles} {...props} />} />
                <Route exact path={`${path}/attendance/:op/:sid?`} render={props => <AttendanceWrap roles={roles} {...props} />} />
                <Route exact path={`${path}/admin/:op`} render={props => <AdminWrap {...props} />} />
                <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
              </Switch>
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

export default (MainCtrl)
