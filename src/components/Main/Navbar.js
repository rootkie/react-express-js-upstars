import React, { Component } from 'react'
import { Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import imgIcon from './assets/images/icon.jpg'

const items = [
  { key: 'Logo', content: <Image src={imgIcon} fluid />, name: 'Logo' },
  { key: 'Home', content: 'Home', name: 'Home' },
  { key: 'Students', content: 'Students', name: 'Students' },
  { key: 'Tutors', content: 'Tutors', name: 'Tutors' },
  { key: 'Enrichment', content: 'Enrichment', name: 'Enrichment' },
  { key: 'Community', content: 'Community', name: 'Community' },
  { key: 'FAQ', content: 'FAQ', name: 'FAQ' },
  { key: 'Gallery', content: 'Gallery', name: 'Gallery' },
  { key: 'Contact Us', content: 'Contact Us', name: 'Contact Us' },
  { key: 'Login', content: 'Login', name: 'Login' },
  { key: 'sRegister', content: 'Student Sign up', name: 'sRegister' },
  { key: 'vRegister', content: 'Volunteer Sign up', name: 'vRegister' }
]

class Navbar extends Component {
  state = {}
  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name })
    this.props.changePage(name)
  }

  render() {
    const { activeItem } = this.state
    return (
        <Menu inverted vertical fluid>
          {
            items.map((item) => (
              <Menu.Item key={item.key} content={item.content} name={item.name} onClick={this.handleItemClick} />
            ))
          }
        </Menu>
    )
  }
}

export default Navbar