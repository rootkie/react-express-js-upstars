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
          <Link to='/students/edit' className={`item ${activeItem === 'studentsedit' && 'active'}`}>edit</Link>
          <Link to='/students/view' className={`item ${activeItem === 'studentsview' && 'active'}`}>view</Link>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        <Menu.Header>Class</Menu.Header>
        <Menu.Menu>
          <Link to='/classes/add' className={`item ${activeItem === 'classesadd' && 'active'}`}>add</Link>
          <Link to='/classes/edit' className={`item ${activeItem === 'classesedit' && 'active'}`}>edit</Link>
          <Link to='/classes/view' className={`item ${activeItem === 'classesview' && 'active'}`}>view</Link>
        </Menu.Menu>
      </Menu.Item>
      <Link to='/volunteer' className={`item ${activeItem === 'volunteer' && 'active'}`}>Volunteer</Link>
      <Link to='/attendance' className={`item ${activeItem === 'attendance' && 'active'}`}>Attendance</Link>
    </Menu>
  </Grid.Column>
)

SideMenu.propTypes = {
  activeItem: PropTypes.string.isRequired
}

export default SideMenu
