import React from 'react'
import { Grid, Menu } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const SideMenu = ({activeItem}) => (
  <Grid.Column width={3}>
    <Menu vertical fluid>
      <Link to='/home' className={`item ${activeItem === 'home' && 'active'}`}>Home</Link>
      <Menu.Item>
        <Menu.Header>Class</Menu.Header>
        <Menu.Menu>
          <Link to='/classes/add' className={`item ${activeItem === 'add' && 'active'}`}>add</Link>
          <Link to='/classes/edit' className={`item ${activeItem === 'edit' && 'active'}`}>edit</Link>
          <Link to='/classes/view' className={`item ${activeItem === 'view' && 'active'}`}>view</Link>
        </Menu.Menu>
      </Menu.Item>
      <Link to='/volunteer' className={`item ${activeItem === 'volunteer' && 'active'}`}>Volunteer</Link>
    </Menu>
  </Grid.Column>
)

SideMenu.propTypes = {
  activeItem: PropTypes.string.isRequired
}

export default SideMenu
