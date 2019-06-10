import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Container,
  Divider,
  Grid,
  Table,
  Header,
  Icon,
  List,
  Menu,
  Image,
  Responsive,
  Segment,
  Sidebar,
  Dropdown
} from 'semantic-ui-react'
import logo from './assets/images/head.jpg'

const DesktopContainer = ({ children }) => {
  return (
    <Responsive {...Responsive.onlyComputer}>
      <Menu
        fixed='top'
        borderless
        size='large'
      >
        <Container>
          <Menu.Item as={Link} to='/'>
                  Home
          </Menu.Item>
          <Menu.Item as='a' href='#' active>Student</Menu.Item>
          <Menu.Item as={Link} to='/volunteer'>Volunteer</Menu.Item>
          <Menu.Item position='right'>
            <Button as={Link} to='/login'>
                    Log in
            </Button>
            <Dropdown button item text='Sign Up' style={{ marginLeft: '0.5em' }}>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/register/volunteer'>Volunteer</Dropdown.Item>
                <Dropdown.Item as={Link} to='/register/student'>Student</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Container>
      </Menu>

      {children}
    </Responsive>
  )
}

DesktopContainer.propTypes = {
  children: PropTypes.node
}

const MobileContainer = ({ children }) => {
  const [sidebarOpened, setSidebar] = useState(false)

  const handlePusherClick = () => {
    if (sidebarOpened) setSidebar(false)
  }

  const handleToggle = () => {
    setSidebar(!sidebarOpened)
  }

  return (
    <Responsive {...Responsive.onlyMobile}>
      <Sidebar.Pushable>
        <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
          <Menu.Item as={Link} to='/'>
              Home
          </Menu.Item>
          <Menu.Item as='a' href='#' active>Student</Menu.Item>
          <Menu.Item as={Link} to='/volunteer'>Volunteer</Menu.Item>
          <Menu.Item as={Link} to='/login'>Log in</Menu.Item>
          <Menu.Item as={Link} to='/register/volunteer'>Sign Up (Volunteer)</Menu.Item>
          <Menu.Item as={Link} to='/register/student'>Sign Up (Student)</Menu.Item>
        </Sidebar>

        <Sidebar.Pusher
          dimmed={sidebarOpened}
          onClick={handlePusherClick}
          style={{ minHeight: '100vh' }}
        >
          <Container>
            <Menu pointing size='large' borderless>
              <Menu.Item onClick={handleToggle}>
                <Icon name='sidebar' />
              </Menu.Item>
              <Menu.Item position='right'>
                <Button as={Link} to='/login'>
                      Log in
                </Button>
                <Dropdown button item text='Sign Up' style={{ marginLeft: '0.5em' }}>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to='/register/volunteer'>Volunteer</Dropdown.Item>
                    <Dropdown.Item as={Link} to='/register/student'>Student</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Menu.Item>
            </Menu>
          </Container>

          {children}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Responsive>
  )
}

MobileContainer.propTypes = {
  children: PropTypes.node
}

const ResponsiveContainer = ({ children }) => (
  <div>
    <DesktopContainer>{children}</DesktopContainer>
    <MobileContainer>{children}</MobileContainer>
  </div>
)

ResponsiveContainer.propTypes = {
  children: PropTypes.node
}

const Student = () => {
  return (
    <div>
      <ResponsiveContainer>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container relaxed stackable centered verticalAlign='middle'>
            <Grid.Row>
              <Image src={logo} fluid />
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Header as='h3' style={{ fontSize: '2em' }}>
              Students&apos; Resources
                </Header>
                <div style={{ fontSize: '1.2em', textAlign: 'justify' }}>
                At UP Stars we offer students from underserved families in Ulu Pandan a conducive learning and growing environment, as well as
                opportunities for students to better themselves. We are dedicated to serving all children and youths and leaving no one behind.
                  <Divider hidden />
                To ensure that students receive close guidance and attention from the tutors, we target to keep the average student to tutor ratio
                at a maximum of 2. Currently, Mathematics and some English are being taught, with the main focus on Mathematics.
                  <Divider hidden />
                The class schedule can be found below. All classes are conducted at Block 3, Ulu Pandan Study Centre, Ghim Moh Road.
                </div>
              </Grid.Column>
            </Grid.Row>
            <Divider horizontal>Schedule</Divider>
            <Grid.Row>
              <Table fixed celled singleLine>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Class Level</Table.HeaderCell>
                    <Table.HeaderCell>Day</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell>Venue</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Primary 1/2</Table.Cell>
                    <Table.Cell>Saturday</Table.Cell>
                    <Table.Cell>10 am – 11.30am</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Primary 3</Table.Cell>
                    <Table.Cell>Saturday</Table.Cell>
                    <Table.Cell>2 - 4 pm</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Primary 4</Table.Cell>
                    <Table.Cell>Wednesday</Table.Cell>
                    <Table.Cell>7:30 - 9 pm</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Primary 5</Table.Cell>
                    <Table.Cell>Tuesday</Table.Cell>
                    <Table.Cell>7 - 9 pm</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Primary 6</Table.Cell>
                    <Table.Cell>Thursday</Table.Cell>
                    <Table.Cell>7 - 9 pm</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Secondary</Table.Cell>
                    <Table.Cell>Friday</Table.Cell>
                    <Table.Cell>7 - 9 pm</Table.Cell>
                    <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                  </Table.Row>

                </Table.Body>
              </Table>
            </Grid.Row>
            <Divider horizontal>Tuition Fees</Divider>
            <Grid.Row>
              <p style={{ fontSize: '1.2em', textAlign: 'justify' }}>There is no fee payable for students who qualify to be in the Stars programme.</p>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment inverted vertical style={{ padding: '5em 0em' }}>
          <Container>
            <Grid divided inverted stackable>
              <Grid.Row>
                <Grid.Column width={5}>
                  <Header inverted as='h4' content='About' />
                  <List link inverted>
                    <List.Item as={Link} to='/sitemap.xml'>Sitemap</List.Item>
                    <List.Item as={Link} to='/student'>Student</List.Item>
                    <List.Item as={Link} to='/volunteer'>Volunteer</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Header inverted as='h4' content='Services' />
                  <List link inverted>
                    <List.Item as={Link} to='/login'>Log In</List.Item>
                    <List.Item as={Link} to='/register/volunteer'>Sign Up (Volunteer)</List.Item>
                    <List.Item as={Link} to='/register/student'>Sign Up (Student)</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Header as='h4' inverted>
                Contact Us
                  </Header>
                  <p>
                    <b>Mrs Hauw SH (Email):</b><br />
                volunteer.upstars@gmail.com
                  </p>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
          &copy; UP Stars 2018 | R3:C0D3. All Rights Reserved.
              </Grid.Row>
            </Grid>
          </Container>
        </Segment>
      </ResponsiveContainer>
    </div>
  )
}

export default Student
