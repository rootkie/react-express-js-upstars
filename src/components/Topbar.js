import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Topbar = ({tab}) => (
  <Menu size='large' fixed='top' color='blue' inverted>
    <Menu.Item header width={2}>UPStars</Menu.Item>
    <Menu.Item header>{tab}</Menu.Item>
    <Menu.Menu position='right'>
      <Dropdown item text='Username'>
        <Dropdown.Menu>
          <Dropdown.Item><Link style={{color: 'black'}} to='/settings'>Settings</Link></Dropdown.Item>
          <Dropdown.Item onClick={() => { console.log('logout') }} >Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  </Menu>
)

Topbar.propTypes = {
  tab: PropTypes.string.isRequired
}

export default Topbar
