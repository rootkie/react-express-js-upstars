import React, { Component } from 'react'
import { Grid, Menu } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class SideMenu extends Component {
  render () {
    let { activeItem, roles } = this.props
    return (
      <Grid.Column width={3}>
        <Menu vertical fluid>
          <Link to='/home' className={`item ${activeItem === 'home' && 'active disabled'}`}>Home</Link>
          <Menu.Item>
            <Menu.Header>Student</Menu.Header>
            <Menu.Menu>
              {(roles.indexOf('SuperAdmin') !== -1) &&
              <Link to='/students/add' className={`item ${activeItem === 'studentsadd' && 'active disabled'}`}>add</Link>
              }
              <Link to='/students/view' className={`item ${activeItem === 'studentsview' && 'active disabled'}`}>view (active)</Link>
              {(roles.indexOf('SuperAdmin') !== -1) &&
              <Link to='/students/viewOthers' className={`item ${activeItem === 'studentsviewOthers' && 'active disabled'}`}>view (others)</Link>
              }
            </Menu.Menu>
          </Menu.Item>
          <Menu.Item>
            <Menu.Header>Class</Menu.Header>
            <Menu.Menu>
              {(roles.indexOf('SuperAdmin') !== -1) &&
              <Link to='/classes/add' className={`item ${activeItem === 'classesadd' && 'active disabled'}`}>add</Link>
              }
              <Link to='/classes/view' className={`item ${activeItem === 'classesview' && 'active disabled'}`}>view</Link>
            </Menu.Menu>
          </Menu.Item>
          {/* view is special for admin only while change password (topbar) refers to operations on self */
            (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Mentor') !== -1) &&
            <Menu.Item>
              <Menu.Header>Volunteer</Menu.Header>
              <Menu.Menu>
                <Link to='/volunteer/view' className={`item ${activeItem === 'volunteerview' && 'active disabled'}`}>view</Link>
              </Menu.Menu>
            </Menu.Item>
          }
          <Menu.Item>
            <Menu.Header>Attendance</Menu.Header>
            <Menu.Menu>
              <Link to='/attendance/add' className={`item ${activeItem === 'attendanceadd' && 'active disabled'}`}>add</Link>
              <Link to='/attendance/search' className={`item ${activeItem === 'attendancesearch' && 'active disabled'}`}>search</Link>
              <Link to='/attendance/user' className={`item ${activeItem === 'attendanceuser' && 'active disabled'}`}>user</Link>
              <Link to='/attendance/student' className={`item ${activeItem === 'attendancestudent' && 'active disabled'}`}>student</Link>
              <Link to='/attendance/class' className={`item ${activeItem === 'attendanceclass' && 'active disabled'}`}>class</Link>
              {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <Link to='/attendance/summary' className={`item ${activeItem === 'attendancesummary' && 'active disabled'}`}>summary</Link>
              }
            </Menu.Menu>
          </Menu.Item>
          {(roles.indexOf('SuperAdmin') !== -1) &&
          <Menu.Item>
            <Menu.Header>Admin</Menu.Header>
            <Menu.Menu>
              <Link to='/admin/status' className={`item ${activeItem === 'adminstatus' && 'active disabled'}`}>change status</Link>
            </Menu.Menu>
          </Menu.Item>
          }
        </Menu>
      </Grid.Column>
    )
  }
}

SideMenu.propTypes = {
  activeItem: PropTypes.string.isRequired,
  roles: PropTypes.array.isRequired
}

export default SideMenu
