import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import Classes from './Classes'
import Home from './Home'
import PropTypes from 'prop-types'
import VolunteerForm from './VolunteerForm'
import Attendance from './Attendance'
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
  render () {
    const { main, op } = this.props.match.params || ''
    return (
      <Container fluid>
        <Topbar tab={main} />
        <Grid style={GridStyle}>
          <SideMenu activeItem={op || ''} />
          <Grid.Column width={13} style={MainContentStyle}>
            {main === 'home' && <Home />}
            {main === 'students' && <StudentWrap op={op} />}
            {main === 'classes' && <Classes op={op} />}
            {main === 'volunteer' && <VolunteerForm />}
            {main === 'attendance' && <Attendance />}
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

MainCtrl.propTypes = {
  match: PropTypes.object
}

export default MainCtrl
