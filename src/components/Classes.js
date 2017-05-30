import React, { Component } from 'react'
import { Container, Grid } from 'semantic-ui-react'
import Topbar from './Topbar'
import SideMenu from './SideMenu'
import Filler from './Filler'
import PropTypes from 'prop-types'

const GridStyle = {
  paddingTop: '4em',
  height: '100vh',
  overflow: 'none',
  margin: '0'
}

const MainContentStyle = {
  overflow: 'auto'
}

class Classes extends Component {
  render () {
    const { op } = this.props.match.params || ''
    return (
      <Container fluid>
        <Topbar tab='Classes' />
        <Grid style={GridStyle}>
          <SideMenu activeItem={op} />
          <Grid.Column width={13} style={MainContentStyle}>
            {op === 'add' && <h2>Add</h2>}
            {op === 'edit' && <h2>Edit</h2>}
            {op === 'view' && <h2>View</h2>}
            <Filler num={10} />
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}

Classes.propTypes = {
  match: PropTypes.object
}

export default Classes
