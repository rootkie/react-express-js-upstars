import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import Filler from './Filler'

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
        <Topbar activeItem={activeItem} />
        <Grid style={GridStyle}>
          <SideMenu activeItem={activeItem} handleItemClick={this.handleItemClick} />
          <Grid.Column width={13} style={MainContentStyle}>
            <Filler num={42} />
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

export default Main
