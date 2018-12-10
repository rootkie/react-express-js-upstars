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
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
  Dropdown,
  Accordion
} from 'semantic-ui-react'
import imgGroup from './assets/images/group.jpg'

class PageHeader extends Component {
  render () {
    const { mobile } = this.props
    this.scroll = () => {
      if (!mobile) {
        window.scrollTo({
          top: 701,
          behaviour: 'smooth'
        })
      } else {
        window.scrollTo({
          top: 351,
          behaviour: 'smooth'
        })
      }
    }

    return (
      <Container text>
        <Header
          as='h1'
          content='Ulu Pandan STARS'
          inverted
          style={{
            fontSize: mobile ? '2em' : '4em',
            fontWeight: 'normal',
            marginBottom: 0,
            marginTop: mobile ? '1.5em' : '3em'
          }}
        />
        <Header
          as='h2'
          content='Learning Opportunity For All'
          inverted
          style={{
            fontSize: mobile ? '1.5em' : '1.7em',
            fontWeight: 'normal',
            marginTop: mobile ? '0.5em' : '1.5em'
          }}
        />
        <Button color='pink' size='huge' onClick={this.scroll}>
        Learn More&nbsp;&nbsp;
          <Icon name='down arrow' />
        </Button>
      </Container>
    )
  }
}

PageHeader.propTypes = {
  mobile: PropTypes.bool
}

class DesktopContainer extends Component {
  state = {}

  hideFixedMenu = () => this.setState({ fixed: false })
  showFixedMenu = () => this.setState({ fixed: true })

  render () {
    const { children } = this.props
    const { fixed } = this.state

    return (
      <Responsive {...Responsive.onlyComputer}>
        <Visibility
          once={false}
          onBottomPassed={this.showFixedMenu}
          onBottomPassedReverse={this.hideFixedMenu}
        >
          <Segment
            inverted
            color='blue'
            textAlign='center'
            style={{ minHeight: 700,
              padding: '1em 0em' }}
            vertical
          >
            <Menu
              fixed={fixed ? 'top' : null}
              inverted={!fixed}
              color={fixed ? null : 'blue'}
              borderless
              size='large'
            >
              <Container>
                <Menu.Item as='a' active href='#'>
                  Home
                </Menu.Item>
                <Menu.Item as={Link} to='/student'>Student</Menu.Item>
                <Menu.Item as={Link} to='/volunteer'>Volunteer</Menu.Item>
                <Menu.Item position='right'>
                  <Button as={Link} to='/login' inverted={!fixed}>
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
            <PageHeader />
          </Segment>
        </Visibility>

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
          <Sidebar as={Menu} animation='uncover' inverted vertical visible={sidebarOpened} color='blue'>
            <Menu.Item as='a' active href='#'>
              Home
            </Menu.Item>
            <Menu.Item as={Link} to='/student'>Student</Menu.Item>
            <Menu.Item as={Link} to='/volunteer'>Volunteer</Menu.Item>
            <Menu.Item as={Link} to='/login'>Log in</Menu.Item>
            <Menu.Item as={Link} to='/register/volunteer'>Sign Up (Volunteer)</Menu.Item>
            <Menu.Item as={Link} to='/register/student'>Sign Up (Student)</Menu.Item>
          </Sidebar>

          <Sidebar.Pusher
            dimmed={sidebarOpened}
            onClick={this.handlePusherClick}
            style={{ minHeight: '100vh' }}
          >
            <Segment
              inverted
              color='blue'
              textAlign='center'
              style={{ minHeight: 350, padding: '1em 0em' }}
              vertical
            >
              <Container>
                <Menu inverted pointing size='large' borderless color='blue'>
                  <Menu.Item onClick={this.handleToggle}>
                    <Icon name='sidebar' />
                  </Menu.Item>
                  <Menu.Item position='right'>
                    <Button as={Link} to='/login' inverted>
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
              <PageHeader mobile />
            </Segment>

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

class Home extends Component {
  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  state = {
    activeIndex: 6
  }

  render () {
    const { activeIndex } = this.state
    return (
      <ResponsiveContainer>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign='middle'>
            <Grid.Row>
              <Grid.Column width={10}>
                <Header as='h3' style={{ fontSize: '2em' }}>
              About Us
                </Header>
                <p style={{ fontSize: '1.33em', textAlign: 'justify' }}>
            Ulu Pandan Star Programme is a joint initiative between Ulu Pandan PAP Community Foundation (PCF) and
            Ulu Pandan Citizen Consultative Committee’s (CCC) – Community Development & Welfare Fund Subcommittee
            (CDWF). The programme works in collaboration with caring and responsible leaders from various Junior
             Colleges for the benefit of children from underserved families in Ulu Pandan.
                </p>
              </Grid.Column>
              <Grid.Column floated='right' width={5}>
                <Image bordered rounded size='large' src={imgGroup} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment style={{ padding: '0em' }} vertical inverted>
          <Grid relaxed columns='equal' stackable>
            <Grid.Row textAlign='center'>
              <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                <Header as='h3' style={{ fontSize: '2.6em' }} color='red'>
              Mission
                </Header>
                <p style={{ fontSize: '1.33em' }}>Offer students from underserved families in Ulu Pandan
            a conducive learning and growing environment, as well as opportunities for students to better themselves. </p>
              </Grid.Column>
              <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                <Header as='h3' style={{ fontSize: '2.6em' }} color='red'>
              Vision
                </Header>
                <p style={{ fontSize: '1.33em' }}>
            To be the 2nd home providing comfort and stability to our students. <br />
            To develop our students holistically to become STARS and inspire them to take ownership of their lives.
                </p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
          <Container text>
            <Header as='h3' style={{ fontSize: '2em' }}>
          The Rabbit and the Tortoise:
            </Header>
            <p style={{ fontSize: '1.2em', textAlign: 'justify' }}>
        On 7th Nov 2009 the Rabbit and the Tortoise came to live. 11 children between P3 and P6 asked themselves:<br /><br /><i style={{ fontSize: '1.33em' }}><b>"</b>Is there something
         I am good at and can spend hours on tirelessly? Parents and friends compliment me for the way I sing or dance or play football
         or basketball? I have talent and will use it to set my goals for my future career!<b>"</b></i>
            </p>
            <p style={{ fontSize: '1.2em', textAlign: 'justify' }}>
        The workshop was filled with activities, to cultivate confidence when speaking in front of people, acting and decision making through
        story telling, whilst interacting as a team with people in the group. Participants are keen to join the next enrichment class to see how
        the rabbit won the race.
            </p>

            <Divider
              as='h3'
              className='header'
              horizontal
              style={{ margin: '3em 0em', textTransform: 'uppercase' }}
            >Enrichments Programmes</Divider>

            <Header as='h3' style={{ fontSize: '2em' }}>
          New <i>UP Stars</i> Enrichment Program Launched
            </Header>
            <p style={{ fontSize: '1.2em', textAlign: 'justify' }}>
        22 children from the Ulu Pandan neighbourhood excitedly gathered on the 4th June 2009 afternoon, at UP Study Centre to participate in
        the inaugural <i>UP Stars</i> Enrichment program. <br /><br />
        Themed <b>“Fox and Hounds”</b>, the children learnt lifeskills on defending themselves from beingbullied and also to correct themselves when
         they occasionally are the bully. The enrichment program hopes to instill values, to positively affect children’s lives.
            </p>
          </Container>
        </Segment>

        <Segment style={{ padding: '8em 0em', color: 'white' }} vertical color='blue' inverted>
          <Grid container stackable verticalAlign='middle'>
            <Grid.Row>
              <Grid.Column>
                <Header as='h2' style={{ fontSize: '2.3em', textAlign: 'center', color: 'white' }}>
              Frequently Asked Questions (FAQ)
                </Header>
                <Accordion fluid>
                  <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick} style={{ fontSize: '1.5em', color: 'white' }}>
                    <Icon name='dropdown' />
                    1. Who does UP Stars provide tuition services to?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 0}>
                    <h2 style={{fontSize: '1.3em'}}>
                    UP Stars provides tuition to children from families living in the Ulu Pandan area.
                     We aim in particular to reach out to underserved families in Ulu Pandan.
                    </h2>
                  </Accordion.Content>

                  <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick} style={{ fontSize: '1.5em', color: 'white' }}>
                    <Icon name='dropdown' />
                    2. How do I sign up for the respective UP Stars services?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 1}>
                    <h2 style={{ fontSize: '1.3em' }}>
                    Go to the Homepage of www.ulupandanstar.org, click on “Sign Up”. Then select based on your requirements.
                    Complete the online e-form and click on “Submit”. We will confirm your registration within 24 hours.
                    </h2>
                  </Accordion.Content>

                  <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick} style={{ fontSize: '1.5em', color: 'white' }}>
                    <Icon name='dropdown' />
                    3. I need to submit details about UP Stars to my school for community service records. What should I put down?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 2}>
                    <h2 style={{ fontSize: '1.3em' }}>
                      <ul>
                        <li>Title of Program: UP Stars</li>
                        <li>Venue: Block 3 Ghim Moh Road</li>
                        <li>Organization: Ulu Pandan PAP Foundation Centre (PCF) and Citizen Consultative Committee (CCC).</li>
                      </ul>
                    </h2>
                  </Accordion.Content>

                  <Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleClick} style={{ fontSize: '1.5em', color: 'white' }}>
                    <Icon name='dropdown' />
                    4. Will I be able to get a letter of recognition?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 3}>
                    <h2 style={{ fontSize: '1.3em' }}>
                    Yes all our tutors will get a letter of certificate that stipulates the number of hours committed to UP Stars.
                    For tutors who make outstanding contributions, there will be strong testimonials in acknowledgement.
                    </h2>
                  </Accordion.Content>

                  <Accordion.Title active={activeIndex === 4} index={4} onClick={this.handleClick} style={{ fontSize: '1.5em', color: 'white' }}>
                    <Icon name='dropdown' />
                     5. I stay in a hostel and I have a curfew. Will UP Star provide me with a letter of excuse?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 4}>
                    <h2 style={{ fontSize: '1.3em' }}>
                    Yes. Please give us the exact details as to whom we should address the letter to and the name of your hostel.
                    </h2>
                  </Accordion.Content>
                </Accordion>
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
                    <List.Item as='a' href='/sitemap.xml'>Sitemap</List.Item>
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
    )
  }
}

export default Home
