import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Topbar = ({tab, name, _id}) => (
  <Menu size='large' fixed='top' color='blue' inverted>
    <Menu.Item header width={2}>UPStars</Menu.Item>
    <Menu.Item header>{tab}</Menu.Item>
    <Menu.Menu position='right'>
      <Dropdown item text={name}>
        <Dropdown.Menu>
          <Dropdown.Item><Link style={{color: 'black'}} to={`/volunteer/profile/${_id}`}>Profile</Link></Dropdown.Item>
          <Dropdown.Item onClick={() => window.localStorage.removeItem('token')}><Link style={{color: 'black'}} to='/'>Logout</Link></Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  </Menu>
)

Topbar.propTypes = {
  tab: PropTypes.string.isRequired,
  name: PropTypes.string,
  _id: PropTypes.string
}

export default Topbar
