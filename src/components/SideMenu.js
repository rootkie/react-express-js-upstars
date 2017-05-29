import React from 'react'
import { Grid, Menu } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const SideMenu = ({activeItem, handleItemClick}) => (
  <Grid.Column width={3}>
    <Menu vertical fluid>
      <Menu.Item name='home' active={activeItem === 'home'} onClick={handleItemClick} />
      <Menu.Item name='messages' active={activeItem === 'messages'} onClick={handleItemClick} />
      <Menu.Item>
        <Menu.Header>Class</Menu.Header>

        <Menu.Menu>
          <Menu.Item name='addClass' active={activeItem === 'addClass'} onClick={handleItemClick}>
            add
          </Menu.Item>
          <Menu.Item name='editClass' active={activeItem === 'editClass'} onClick={handleItemClick}>
            edit
          </Menu.Item>
          <Menu.Item name='viewClass' active={activeItem === 'viewClass'} onClick={handleItemClick}>
            view
          </Menu.Item>
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  </Grid.Column>
)

SideMenu.propTypes = {
  activeItem: PropTypes.string.isRequired,
  handleItemClick: PropTypes.func.isRequired
}

export default SideMenu
