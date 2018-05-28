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
          <Link to={`/volunteer/profile/${_id}`}><Dropdown.Item style={{color: 'black'}}>Profile</Dropdown.Item></Link>
          <Link to={`/volunteer/changepassword`}><Dropdown.Item style={{color: 'black'}}>Change Password</Dropdown.Item></Link>
          <Link to='/'><Dropdown.Item onClick={() => window.localStorage.removeItem('token')} style={{color: 'black'}}>Logout</Dropdown.Item></Link>
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
