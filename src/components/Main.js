import React, { Component } from 'react'
import { Container, Grid, Segment, Menu } from 'semantic-ui-react'

const GridStyle = {
  paddingTop: '4em',
  height: '100vh',
  overflow: 'none'
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
          <Menu.Item header>UPStars</Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
            <Menu.Item name='class' active={activeItem === 'class'} onClick={this.handleItemClick} />
          </Menu.Menu>
        </Menu>
        <Grid style={GridStyle}>
          <Grid.Column width={3}>
            <Menu pointing secondary vertical fluid>
              <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
              <Menu.Item name='messages' active={activeItem === 'messages'} onClick={this.handleItemClick} />
              <Menu.Item name='class' active={activeItem === 'class'} onClick={this.handleItemClick} />
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
