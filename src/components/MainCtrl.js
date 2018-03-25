import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Container, Grid } from 'semantic-ui-react'
import axios from 'axios'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import ClassWrap from './Class/ClassWrap'
import Home from './Home'
import { object } from 'prop-types'
import VolunteerWrap from './Volunteer/VolunteerWrap'
import AttendanceWrap from './Attendance/AttendanceWrap'
import StudentWrap from './Student/StudentWrap'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'
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

class MainCtrl extends Component {
  static propTypes = {
    match: object
  }

  state = {
    isLoggedIn: true
  }

  isLoggedIn = () => {
    return axios.get('/check')
      .then(response => {
        this.setState({ isLoggedIn: response.data.auth })
      }).catch((err) => {
        console.log(err)
      })
  }

  constructor (props) {
    super()
    this.isLoggedIn()
  }

  componentWillReceiveProps (nextProps) {
    this.isLoggedIn()
  }

  render () {
    const { main, op, sid } = this.props.match.params || ''

    if (!this.state.isLoggedIn) {
      console.log('we getting em login errors?')
      return <Redirect to='/login' />
    }

    return (
      <Container fluid>
        <Topbar tab={main} />
        <Grid style={GridStyle}>
          <SideMenu activeItem={main + op || ''} />
          <Grid.Column width={13} style={MainContentStyle}>
            {main === 'home' && <Home />}
            {main === 'students' && <StudentWrap op={op} sid={sid} />}
            {main === 'classes' && <ClassWrap op={op} sid={sid} />}
            {main === 'volunteer' && <VolunteerWrap op={op} />}
            {main === 'attendance' && <AttendanceWrap op={op} sid={sid} />}
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

export default MainCtrl
