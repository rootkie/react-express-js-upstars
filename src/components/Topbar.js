import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const Topbar = ({activeItem}) => (
  <Menu size='large' fixed='top'>
    <Menu.Item header width={2}>UPStars</Menu.Item>
    <Menu.Item header>{activeItem}</Menu.Item>
    <Menu.Menu position='right'>
      <Dropdown item text='Username'>
        <Dropdown.Menu>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Item>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  </Menu>
)

Topbar.propTypes = {
  activeItem: PropTypes.string.isRequired
}

export default Topbar
