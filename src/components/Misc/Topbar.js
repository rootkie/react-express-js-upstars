import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Topbar = ({ name, _id }) => (
  <Menu size='large' fixed='top' color='blue' inverted>
    <Menu.Item header width={2}>UPStars [beta v0.7.0]</Menu.Item>
    <Menu.Menu position='right'>
      <Dropdown item text={name}>
        <Dropdown.Menu>
          <Link to={`/dashboard/volunteer/profile/${_id}`}><Dropdown.Item style={{ color: 'black' }}>Profile</Dropdown.Item></Link>
          <Link to={`/dashboard/volunteer/changepassword`}><Dropdown.Item style={{ color: 'black' }}>Change Password</Dropdown.Item></Link>
          <Link to='/'><Dropdown.Item onClick={() => {
            window.localStorage.removeItem('token')
            window.localStorage.removeItem('refreshToken')
          }} style={{ color: 'black' }}>Logout</Dropdown.Item></Link>
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  </Menu>
)

Topbar.propTypes = {
  name: PropTypes.string,
  _id: PropTypes.string
}

export default React.memo(Topbar)
