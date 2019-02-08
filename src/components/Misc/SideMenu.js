import React from 'react'
import { Grid, Menu } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

const SideMenu = ({roles}) => {
  return (
    <Grid.Column width={3}>
      <Menu vertical fluid>
        <NavLink to='/dashboard/home' className='item' activeClassName='active disabled'>Home</NavLink>
        <Menu.Item>
          <Menu.Header>Student</Menu.Header>
          <Menu.Menu>
            {(roles.indexOf('SuperAdmin') !== -1) &&
              <NavLink to='/dashboard/students/add' className='item' activeClassName='active disabled'>add</NavLink>
            }
            <NavLink to='/dashboard/students/view' className='item' activeClassName='active disabled'>view (active)</NavLink>
            {(roles.indexOf('SuperAdmin') !== -1) &&
              <NavLink to='/dashboard/students/viewOthers' className='item' activeClassName='active disabled'>view (others)</NavLink>
            }
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item>
          <Menu.Header>Class</Menu.Header>
          <Menu.Menu>
            {(roles.indexOf('SuperAdmin') !== -1) &&
              <NavLink to='/dashboard/classes/add' className='item' activeClassName='active disabled'>add</NavLink>
            }
            <NavLink to='/dashboard/classes/view' className='item' activeClassName='active disabled'>view</NavLink>
          </Menu.Menu>
        </Menu.Item>
        {/* view is special for admin only while change password (topbar) refers to operations on self */
          (roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Mentor') !== -1) &&
            <Menu.Item>
              <Menu.Header>Volunteer</Menu.Header>
              <Menu.Menu>
                <NavLink to='/dashboard/volunteer/view' className='item' activeClassName='active disabled'>view</NavLink>
              </Menu.Menu>
            </Menu.Item>
        }
        <Menu.Item>
          <Menu.Header>Attendance</Menu.Header>
          <Menu.Menu>
            <NavLink to='/dashboard/attendance/add' className='item' activeClassName='active disabled'>add</NavLink>
            <NavLink to='/dashboard/attendance/search' className='item' activeClassName='active disabled'>search</NavLink>
            <NavLink to='/dashboard/attendance/user' className='item' activeClassName='active disabled'>user</NavLink>
            <NavLink to='/dashboard/attendance/student' className='item' activeClassName='active disabled'>student</NavLink>
            <NavLink to='/dashboard/attendance/class' className='item' activeClassName='active disabled'>class</NavLink>
            {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
              <NavLink to='/dashboard/attendance/summary' className='item' activeClassName='active disabled'>summary</NavLink>
            }
          </Menu.Menu>
        </Menu.Item>
        {(roles.indexOf('SuperAdmin') !== -1) &&
          <Menu.Item>
            <Menu.Header>Admin</Menu.Header>
            <Menu.Menu>
              <NavLink to='/dashboard/admin/status' className='item' activeClassName='active disabled'>change status</NavLink>
            </Menu.Menu>
          </Menu.Item>
        }
      </Menu>
    </Grid.Column>
  )
}

SideMenu.propTypes = {
  roles: PropTypes.array.isRequired
}

export default SideMenu
