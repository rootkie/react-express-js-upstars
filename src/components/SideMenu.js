import React from 'react'
import { Grid, Menu } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const SideMenu = ({activeItem}) => (
  <Grid.Column width={3}>
    <Menu vertical fluid>
      <Link to='/home' className={`item ${activeItem === 'home' && 'active'}`}>Home</Link>
      <Menu.Item>
        <Menu.Header>Student</Menu.Header>
        <Menu.Menu>
          <Link to='/students/add' className={`item ${activeItem === 'studentsadd' && 'active'}`}>add</Link>
          <Link to='/students/view' className={`item ${activeItem === 'studentsview' && 'active'}`}>view</Link>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        <Menu.Header>Class</Menu.Header>
        <Menu.Menu>
          <Link to='/classes/add' className={`item ${activeItem === 'classesadd' && 'active'}`}>add</Link>
          <Link to='/classes/view' className={`item ${activeItem === 'classesview' && 'active'}`}>view</Link>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        <Menu.Header>Volunteer</Menu.Header>
        <Menu.Menu>
          <Link to='/volunteer/form-admin' className={`item ${activeItem === 'volunteerform-admin' && 'active'}`}>Admin Form</Link>
          <Link to='/volunteer/form' className={`item ${activeItem === 'volunteerform' && 'active'}`}>Form</Link>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        <Menu.Header>Attendance</Menu.Header>
        <Menu.Menu>
          <Link to='/attendance/add' className={`item ${activeItem === 'attendanceadd' && 'active'}`}>add</Link>
          <Link to='/attendance/search' className={`item ${activeItem === 'attendancesearch' && 'active'}`}>search</Link>
          <Link to='/attendance/user' className={`item ${activeItem === 'attendanceuser' && 'active'}`}>user</Link>
          <Link to='/attendance/student' className={`item ${activeItem === 'attendancestudent' && 'active'}`}>student</Link>
          <Link to='/attendance/class' className={`item ${activeItem === 'attendanceclass' && 'active'}`}>class</Link>
          <Link to='/attendance/summary' className={`item ${activeItem === 'attendancesummary' && 'active'}`}>summary</Link>
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  </Grid.Column>
)

SideMenu.propTypes = {
  activeItem: PropTypes.string.isRequired
}

export default SideMenu
