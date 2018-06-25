import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  List,
  Image,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Dropdown
} from 'semantic-ui-react'
import logo from './assets/images/head.jpg'

class DesktopContainer extends Component {
  render () {
    const { children } = this.props

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Menu
          fixed='top'
          color='white'
          borderless
          size='large'
        >
          <Container>
            <Menu.Item as={Link} to='/'>
                  Home
            </Menu.Item>
            <Menu.Item as={Link} to='/student'>Student</Menu.Item>
            <Menu.Item as='a' active href='#'>Volunteer</Menu.Item>
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
}

DesktopContainer.propTypes = {
  children: PropTypes.node
}

class MobileContainer extends Component {
  state = {}

  handlePusherClick = () => {
    const { sidebarOpened } = this.state

    if (sidebarOpened) this.setState({ sidebarOpened: false })
  }

  handleToggle = () => this.setState({ sidebarOpened: !this.state.sidebarOpened })

  render () {
    const { children } = this.props
    const { sidebarOpened } = this.state

    return (
      <Responsive {...Responsive.onlyMobile}>
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened}>
            <Menu.Item as={Link} to='/'>
              Home
            </Menu.Item>
            <Menu.Item as={Link} to='/student'>Student</Menu.Item>
            <Menu.Item as='a' active href='#'>Volunteer</Menu.Item>
            <Menu.Item as={Link} to='/login'>Log in</Menu.Item>
            <Menu.Item as={Link} to='/register/volunteer'>Sign Up (Volunteer)</Menu.Item>
            <Menu.Item as={Link} to='/register/student'>Sign Up (Student)</Menu.Item>
          </Sidebar>

          <Sidebar.Pusher
            dimmed={sidebarOpened}
            onClick={this.handlePusherClick}
            style={{ minHeight: '100vh' }}
          >
            <Container>
              <Menu pointing size='large' borderless>
                <Menu.Item onClick={this.handleToggle}>
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

class Volunteer extends Component {
  render () {
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
              Volunteers' Resources
                  </Header>
                  <p style={{ fontSize: '1.2em', textAlign: 'justify' }}>
                Within this UPStars programme, we aim to:
                    <ol>
                      <li>UP Stars aims to  develop in our tutors, core competencies and skill sets that are relevant to  their future roles in society. </li>
                      <li>Our tutors are  given autonomy in the classroom to organize and conduct their lessons in the  manner that they find most beneficial for their students. </li>
                      <li>Every UP Stars  class is conducted differently based on the tutors discretion and creativity. </li>
                      <li>Tutors are  encouraged to attend workshops and gatherings exclusive to UP Stars that are  organized based on their interests and needs. </li>
                    </ol>
                  </p>
                </Grid.Column>
              </Grid.Row>
              <Divider horizontal>Responsibilities</Divider>
              <Grid.Row>
                <Grid.Column>
                  <p style={{ fontSize: '1.2em' }}>
                    <ol>
                      <li style={{ fontSize: '1.33em' }}><b>UP Stars</b></li>
                      <ul>
                        <li>Do remember that  you are committed to this program for one academic year (January to November)</li>
                        <li>Do reply to  emails, text messages, phone-calls promptly to acknowledge that you have  received the information, or to confirm attendance for events</li>
                        <li>If you are a JC2  student and will like to focus on your studies after the mid year, please find  someone to replace you</li>
                        <li>Do spread the  word about UP Stars and encourage your friends to sign up</li>
                        <li>Please return the  key to the student centre at the end of the year to UP Stars</li>
                        <li>Please join UP  Stars facebook group. </li>
                      </ul>
                      <Divider hidden />
                      <li style={{ fontSize: '1.33em' }}><b>Students</b></li>
                      <ul>
                        <li>Please treat all  students fairly </li>
                        <li>Do befriend your  students to find out their interests, hobbies, academic weaknesses, etc</li>
                        <li>Be respectful of  your students; some of them are shy and academically weaker. Be supportive and  encouraging!</li>
                        <li>Do remember to  call your students a few days before class to encourage them to come</li>
                        <li>Do give one week  notice to your students for any class cancellation </li>
                        <li>Do start and  attend class on time and end class punctually</li>
                        <li>Do refrain from  using treats and sweets as a form of incentive</li>
                        <li>You are welcome  to hold extra classes for the students during the holidays or outside tuition  hours at the student centre. Please remember to inform us before the extra  classes</li>
                        <li>Classes will not  be held on public holidays</li>
                      </ul>
                      <Divider hidden />
                      <li style={{ fontSize: '1.33em' }}><b>The Study Centre</b></li>
                      <ol>
                        <li>Do be mindful of  the noise levels; the student centre is a facility shared by other users</li>
                        <li>Do keep the  student centre clean. Throw all rubbish, especially food containers in the  dustbins outside</li>
                        <li>Do remember to  sign in and sign out at the logbook for security reasons</li>
                      </ol>
                      <Divider hidden />
                      <li style={{ fontSize: '1.33em' }}><b>Fellow Tutors</b></li>
                      <ul>
                        <li>Do communicate  with one another regularly to keep each other informed about your attendance</li>
                        <li>Do appoint a  group leader who will be responsible for attendance taking </li>
                        <li>Do exchange ideas  about how to engage the students </li>
                        <li>Do be supportive of one  another</li>
                      </ul>
                    </ol>
                  </p>
                </Grid.Column>
              </Grid.Row>
              <Divider horizontal>Materials</Divider>
              <Grid.Row>
                <Grid.Column>
                  <p style={{ fontSize: '1.2em' }}>
                    <ol>
                      <li>Please register  at ( <a href='http://test-paper.info/'>http://test-paper.info/</a>) </li>
                      <li>Do appoint  someone to be in charge of photocopying the worksheets for the students and we  will reimburse you for the photocopying</li>
                      <li>Please keep the  answers and solutions for the students</li>
                      <li>Feel free to  source for your own material (topical assessment books) and UP Stars will  reimburse you for them</li>
                      <li>Please keep all  receipts for reimbursement purposes </li>
                    </ol>
                  </p>
                </Grid.Column>
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
                      <List.Item as='a'>Sitemap</List.Item>
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
          &copy; UPStars 2018 | R3:C0D3. All Rights Reserved.
                </Grid.Row>
              </Grid>
            </Container>
          </Segment>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default Volunteer
