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
import AdminWrap from './Admin/AdminWrap'

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

class MainCtrl extends Component {
  static propTypes = {
    match: object
  }

  state = {
    isLoggedIn: true,
    name: '',
    id: ''
  }

  isLoggedIn = () => {
    return axios.get('/check')
      .then(response => {
        if (response.data.auth === false) {
          this.setState({ isLoggedIn: false })
        } else {
          let { name, classes, _id, roles } = response.data
          this.setState({ name, _id, classes, roles })
        }
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
    const { name, _id, classes, roles } = this.state

    if (!this.state.isLoggedIn) {
      console.log('we getting em login errors?')
      return <Redirect to='/login' />
    }

    return (
      <Container fluid>
        <Topbar tab={main} name={name} _id={_id} />
        <Grid style={GridStyle}>
          <SideMenu activeItem={main + op || ''} _id={_id} />
          <Grid.Column width={13} style={MainContentStyle}>
            {main === 'home' && <Home />}
            {main === 'students' && <StudentWrap op={op} sid={sid} />}
            {main === 'classes' && <ClassWrap op={op} sid={sid} />}
            {main === 'volunteer' && <VolunteerWrap op={op} sid={sid} />}
            {main === 'attendance' && <AttendanceWrap op={op} sid={sid} />}
            {main === 'admin' && <AdminWrap op={op} />}
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

export default MainCtrl
