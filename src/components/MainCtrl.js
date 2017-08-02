import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import ClassWrap from './ClassWrap'
import Home from './Home'
import { object } from 'prop-types'
import VolunteerWrap from './VolunteerWrap'
import AttendanceWrap from './AttendanceWrap'
import StudentWrap from './StudentWrap'

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

  render () {
    const { main, op, sid } = this.props.match.params || ''
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
