import React, { Component } from 'react'
import { Container, Grid, Segment, Menu, Dropdown } from 'semantic-ui-react'

const GridStyle = {
  paddingTop: '4em',
  height: '100vh',
  overflow: 'none',
  margin: '0'
}

const MainContentStyle = {
  overflow: 'auto'
}

class Main extends Component {
  state = { activeItem: 'home' }
  handleItemClick = (e, { name }) => {
    this.setState({activeItem: name})
  }
  render () {
    const { activeItem } = this.state
    return (
      <Container fluid>
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
        <Grid style={GridStyle}>
          <Grid.Column width={3}>
            <Menu vertical fluid>
              <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
              <Menu.Item name='messages' active={activeItem === 'messages'} onClick={this.handleItemClick} />
              <Menu.Item>
                <Menu.Header>Class</Menu.Header>

                <Menu.Menu>
                  <Menu.Item name='addClass' active={activeItem === 'addClass'} onClick={this.handleItemClick}>
                    add
                  </Menu.Item>
                  <Menu.Item name='editClass' active={activeItem === 'editClass'} onClick={this.handleItemClick}>
                    edit
                  </Menu.Item>
                  <Menu.Item name='viewClass' active={activeItem === 'viewClass'} onClick={this.handleItemClick}>
                    view
                  </Menu.Item>
                </Menu.Menu>
              </Menu.Item>
            </Menu>
          </Grid.Column>
          <Grid.Column width={13} style={MainContentStyle}>
            <Container fluid>
              <Segment>
         I'm here to tell you something, and you will probably read me first.
       </Segment>
              <Segment secondary>
         I am pretty noticeable but you might check out other content before you look at me.
       </Segment>
              <Segment tertiary>
         If you notice me you must be looking very hard.
       </Segment> <Segment>
          I'm here to tell you something, and you will probably read me first.
        </Segment>
              <Segment secondary>
          I am pretty noticeable but you might check out other content before you look at me.
        </Segment>
              <Segment tertiary>
          If you notice me you must be looking very hard.
        </Segment> <Segment>
          I'm here to tell you something, and you will probably read me first.
        </Segment>
              <Segment secondary>
          I am pretty noticeable but you might check out other content before you look at me.
        </Segment>
              <Segment tertiary>
          If you notice me you must be looking very hard.
        </Segment> <Segment>
          I'm here to tell you something, and you will probably read me first.
        </Segment>
              <Segment secondary>
          I am pretty noticeable but you might check out other content before you look at me.
        </Segment>
              <Segment tertiary>
          If you notice me you must be looking very hard.
        </Segment>
            </Container>
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

export default Main
