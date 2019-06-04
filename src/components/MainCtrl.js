import React, { useReducer, useEffect, Suspense, lazy } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Container, Grid, Dimmer, Loader, Header, Icon } from 'semantic-ui-react'
import axios from 'axios'
import PropTypes from 'prop-types'
import ErrorPage from './Error/ErrorPage'
const Topbar = lazy(() => import('./Misc/Topbar'))
const SideMenu = lazy(() => import('./Misc/SideMenu'))
const ClassWrap = lazy(() => import('./Class/ClassWrap'))
const Home = lazy(() => import('./Home/Home'))
const VolunteerWrap = lazy(() => import('./Volunteer/VolunteerWrap'))
const AttendanceWrap = lazy(() => import('./Attendance/AttendanceWrap'))
const StudentWrap = lazy(() => import('./Student/StudentWrap'))
const AdminWrap = lazy(() => import('./Admin/AdminWrap'))

// For production automatic during npm build
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'https://upstars.wonyk.com/api'
} else {
  // For development automatic during npm start or npm test
  axios.defaults.baseURL = 'http://127.0.0.1:3000/api'
}
axios.defaults.headers.common['x-access-token'] = window.localStorage.token
axios.defaults.headers.post['Content-Type'] = 'application/json'

// CSS Stuff for the dashboard page
const GridStyle = {
  paddingTop: '4em',
  height: '100vh',
  overflow: 'none',
  margin: '0'
}

const MainContentStyle = {
  overflow: 'auto'
}

// Global Functions
let forceRefresh

const initialState = {
  isLoggedIn: true,
  confirm: false,
  roles: [],
  name: '',
  _id: '',
  errorCode: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'success':
      const { roles, _id, name } = action
      return {
        ...state,
        roles,
        name,
        _id,
        confirm: true
      }
    case 'redirectLogin':
      return {
        ...state,
        isLoggedIn: false
      }
    case 'showError':
      return {
        ...state,
        errorCode: action.errorCode
      }
    default:
      return state
  }
}

/*
=============
FUNCTIONS
=============
*/

const isUserLoggedIn = async (dispatch) => {
  try {
    const response = await axios.get('/check')
    // If expired or malformed, we check if refresh token is available
    // If it is, send it in to get a new x-access-token (a faulty refresh token will return null as access token)
    // isLoggedIn() is then called again to ensure access token is valid
    // Else if there are any errors anywhere, auth status default to false.
    if (response.data.auth === false) {
      const refreshToken = window.localStorage.refreshToken
      if (!refreshToken) {
        // Redirect them to Login Page if they don't even if a refresh token.
        dispatch({ type: 'redirectLogin' })
      } else {
        let rawRefreshResponse = await axios.post('/refresh', { refreshToken })
        if (rawRefreshResponse.data.status === true) {
          const { token } = rawRefreshResponse.data
          window.localStorage.setItem('token', token)
          axios.defaults.headers.common['x-access-token'] = token
          return isUserLoggedIn(dispatch)
        } else {
          // If refresh token is invalid, remove both and redirect them to Login for security.
          window.localStorage.removeItem('token')
          window.localStorage.removeItem('refreshToken')
          dispatch({ type: 'redirectLogin' })
        }
      }
    } else if (response.data.auth === true) {
      let { name, _id, roles } = response.data
      return dispatch({ type: 'success', name, _id, roles })
    } else if (response.data.auth === 'expiring') {
      // Silently change access token in the background, everything will continue. Cases of invalid refresh token is ignored.
      // Since MainCtrl checks the expiry, there will be no expiry checks in Login.
      const { name, _id, roles } = response.data
      dispatch({ type: 'success', name, _id, roles })
      const refreshToken = window.localStorage.refreshToken
      if (refreshToken) {
        const rawRefreshResponse = await axios.post('/refresh', { refreshToken })
        const { token, status } = rawRefreshResponse.data
        if (status === true) {
          window.localStorage.setItem('token', token)
          axios.defaults.headers.common['x-access-token'] = token
        } else {
          window.localStorage.removeItem('token')
          window.localStorage.removeItem('refreshToken')
          dispatch({ type: 'redirectLogin' })
        }
      }
    }
  } catch (err) {
    dispatch({ type: 'redirectLogin' })
  }
}

const setTimeInterval = (dispatch) => {
  //  Force a token refresh every 10 mins
  forceRefresh = window.setInterval(() => {
    isUserLoggedIn(dispatch)
  }, 600000)
}
const clearTimeInterval = () => {
  window.clearInterval(forceRefresh)
}

const loadingPage = (
  <Dimmer active page>
    <Header as='h2' icon inverted>
      <Icon name='dashboard' />
        Loading the dashboard.
      <Header.Subheader>Thank you for your patience</Header.Subheader>
    </Header>
  </Dimmer>
)

const Upgrade = () => (
  <div>
    <p>
      Please upgrade to the newest browsers. We recommend Chrome, Firefox, Opera or Edge.
    </p>
  </div>
)

const isIE = /* @cc_on!@ */false || !!document.documentMode

/*
================
MAIN FUNCTION
================
*/

const MainCtrl = ({ match }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Runs every time 'match' props change, similar to componentDidUpdate
  // Refer to https://reactjs.org/docs/hooks-effect.html#detailed-explanation for more information
  useEffect(() => {
    isUserLoggedIn(dispatch)
  }, [match])

  useEffect(() => {
    // Catch all non 2xx responses that occur in the dashboard. Login is not affected.
    const myInterceptor = axios.interceptors.response.use(response => {
      return response
    }, error => {
      if (error.response && (error.response.status === 500 || error.response.status === 404 || error.response.status === 403)) {
        const errorCode = error.response.status
        dispatch({ type: 'showError', errorCode })
      }
      // Error such as 400 || 401 are handled locally.
      return Promise.reject(error)
    })
    return () => {
      //  Once unmount, remove the axios interceptors so that there will not be unintended effects to other pages etc
      axios.interceptors.response.eject(myInterceptor)
    }
  }, [match])

  useEffect(() => {
    setTimeInterval(dispatch)
    return () => {
      clearTimeInterval()
    }
  }, [match])

  /*
  ===============
  RENDER
  ===============
  */

  const { path } = match
  const { name, _id, roles, errorCode, isLoggedIn, confirm } = state

  if (isIE) {
    return <Upgrade />
  }
  if (!isLoggedIn) {
    return <Redirect to='/login' />
  } if (errorCode === 404) {
    return (
      <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />
    )
  } if (errorCode === 403) {
    return (
      <ErrorPage statusCode={'403 FORBIDDEN'} errorMessage={'Your client does not have the permission to access this! That\'s all we know.'} />
    )
  } if (errorCode === 500) {
    return (
      <ErrorPage statusCode={'500 INTERNAL SERVER ERROR'} errorMessage={'The server encountered an error and could not complete your request. Please try again later.'} />
    )
  } else if (isLoggedIn && confirm) {
    return (
      <Container fluid>
        <Suspense fallback={loadingPage}>
          <Topbar name={name} _id={_id} />
          <Grid style={GridStyle} stackable>
            <SideMenu roles={roles} />
            <Grid.Column width={13} style={MainContentStyle}>
              {/* Path refers to /dashboard that is inherited */}
              {/* Render is better than component for inline components: (Doesn't need to reload the DOM every time you access it (like back button))
              Refer to link - https://reacttraining.com/react-router/web/api/Route/render-func */}
              <Switch>
                <Route exact path={`${path}/home`} render={() => <Home roles={roles} />} />
                <Route path={`${path}/students`} render={props => <StudentWrap roles={roles} {...props} />} />
                <Route path={`${path}/classes`} render={props => <ClassWrap roles={roles} {...props} />} />
                <Route path={`${path}/volunteer`} render={props => <VolunteerWrap _id={_id} roles={roles} {...props} />} />
                <Route path={`${path}/attendance`} render={props => <AttendanceWrap roles={roles} {...props} />} />
                <Route path={`${path}/admin`} render={props => <AdminWrap {...props} />} />
                <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
              </Switch>
            </Grid.Column>
          </Grid>
        </Suspense>
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

MainCtrl.propTypes = {
  match: PropTypes.object.isRequired
}

export default MainCtrl
