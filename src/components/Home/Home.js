import React, { useState, useEffect } from 'react'
import { Grid, Card, Statistic, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'

const initialState = {
  totalUserEstimate: 0,
  newUserJoined: 0,
  totalClassesEstimate: 0,
  totalClassesHeldEstimate: 0,
  newClassesHeld: 0,
  totalStudentEstimate: 0,
  newStudentJoined: 0
}

const getDashboardStats = async (setState) => {
  const rawResponse = await axios.get('stats/dashboard')
  setState(rawResponse.data)
}

const Home = ({roles}) => {
  const [state, setState] = useState(initialState)
  const { totalUserEstimate, newUserJoined, totalClassesEstimate, totalClassesHeldEstimate, newClassesHeld, totalStudentEstimate, newStudentJoined } = state
  // useEffect here runs only once on render unless the page is refreshed
  useEffect(() => {
    getDashboardStats(setState)
  }, [])

  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <h2>Welcome to UP Stars DASHBOARD</h2>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Statistic.Group widths='ten'>
            <Statistic size='large'>
              <Statistic.Value>{totalUserEstimate}</Statistic.Value>
              <Statistic.Label>Users</Statistic.Label>
            </Statistic>
            <Statistic color='green' size='mini'>
              <Statistic.Value><Icon.Group><Icon name='user' /><Icon corner='bottom right' name='add' /></Icon.Group> {newUserJoined}</Statistic.Value>
              <Statistic.Label>Users Joined<br />(Last 30 Days)</Statistic.Label>
            </Statistic>
            <Statistic size='large'>
              <Statistic.Value>{totalStudentEstimate}</Statistic.Value>
              <Statistic.Label>Students</Statistic.Label>
            </Statistic>
            <Statistic color='green' size='mini'>
              <Statistic.Value><Icon.Group><Icon name='student' /><Icon corner='bottom right' name='add' /></Icon.Group> {newStudentJoined}</Statistic.Value>
              <Statistic.Label>Students Joined<br />(Last 30 Days)</Statistic.Label>
            </Statistic>
            <Statistic size='large'>
              <Statistic.Value>{totalClassesHeldEstimate}</Statistic.Value>
              <Statistic.Label>Classes Held</Statistic.Label>
            </Statistic>
            <Statistic color='green' size='mini'>
              <Statistic.Value><Icon.Group><Icon name='book' /><Icon corner='bottom right' name='add' /></Icon.Group> {newClassesHeld}</Statistic.Value>
              <Statistic.Label>New Lessons Held<br />(Last 30 Days)</Statistic.Label>
            </Statistic>
            <Statistic size='large'>
              <Statistic.Value>{totalClassesEstimate}</Statistic.Value>
              <Statistic.Label>Total Classes</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <h2>Students</h2>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow='4'>
            {(roles.indexOf('SuperAdmin') !== -1) &&
            <Card
              as={Link}
              to='/dashboard/students/add'
              header='Add Student'
              description='Add new students into the system'
            />
            }
            <Card
              as={Link}
              to='/dashboard/students/view'
              header='View Active Student'
              description='View all active students'
            />
            {(roles.indexOf('SuperAdmin') !== -1) &&
            <Card
              as={Link}
              to='/dashboard/students/viewOthers'
              header='View Non-Active Student'
              description='View suspended or deleted students'
            />
            }
          </Card.Group>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <h2>Classes</h2>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow='4'>
            {(roles.indexOf('SuperAdmin') !== -1) &&
            <Card
              as={Link}
              to='/dashboard/classes/add'
              header='Add Classes'
              description='Create a new class'
            />
            }
            <Card
              as={Link}
              to='/dashboard/classes/view'
              header='View Classes'
              description='View all classes with the information'
            />
          </Card.Group>
        </Grid.Column>
      </Grid.Row>
      {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Mentor') !== -1) &&
      <Grid.Row>
        <Grid.Column>
          <h2>Users</h2>
        </Grid.Column>
      </Grid.Row>
      }
      {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1 || roles.indexOf('Mentor') !== -1) &&
      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow='4'>
            <Card
              as={Link}
              to='/dashboard/volunteer/view'
              header='View volunteers'
              description='View all information of the users'
            />
          </Card.Group>
        </Grid.Column>
      </Grid.Row>
      }
      <Grid.Row>
        <Grid.Column>
          <h2>Attendance</h2>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow='4'>
            <Card
              as={Link}
              to='/dashboard/attendance/add'
              header='Add Attendance'
              description='Create a new attendance record'
            />
            <Card
              as={Link}
              to='/dashboard/attendance/search'
              header='Search Attendance'
              description='Search with custom filters'
            />
            <Card
              as={Link}
              to='/dashboard/attendance/user'
              header='List User Attendance'
              description='Filter user attendances'
            />
          </Card.Group>
          <Card.Group itemsPerRow='4'>
            <Card
              as={Link}
              to='/dashboard/attendance/student'
              header='List Student Attendance'
              description='Filter student attendances'
            />
            <Card
              as={Link}
              to='/dashboard/attendance/class'
              header='List Class Attendance'
              description='Filter class attendance summary'
            />
            {(roles.indexOf('Admin') !== -1 || roles.indexOf('SuperAdmin') !== -1) &&
            <Card
              as={Link}
              to='/dashboard/attendance/summary'
              header='Summary - Class Attendance'
              description='Summary of all Classes Attendances'
            />
            }
          </Card.Group>
        </Grid.Column>
      </Grid.Row>
      {(roles.indexOf('SuperAdmin') !== -1) &&
      <Grid.Row>
        <Grid.Column>
          <h2>Admin</h2>
        </Grid.Column>
      </Grid.Row>
      }
      {(roles.indexOf('SuperAdmin') !== -1) &&
      <Grid.Row>
        <Grid.Column>
          <Card.Group itemsPerRow='4'>
            <Card
              as={Link}
              to='/dashboard/admin/status'
              header='Change Status'
              description='View and change status'
            />
          </Card.Group>
        </Grid.Column>
      </Grid.Row>
      }
      <Grid.Row></Grid.Row>
    </Grid>
  )
}

Home.propTypes = {
  roles: PropTypes.array.isRequired
}
export default Home
