import React, { useState, useEffect } from 'react'
import { Table, Header, Icon, Dimmer, Loader, Grid } from 'semantic-ui-react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const AttendanceSummary = () => {
  const [isLoading, setLoading] = useState(true)
  const [summaryData, setData] = useState([])

  useEffect(() => {
    retrieveData()
  }, [])

  const retrieveData = async () => {
    const response = await axios.get('attendance/summary/all')
    setData(response.data.editedActiveClass)
    setLoading(false)
  }

  /*
  ===========
  RENDER
  ===========
  */
  if (isLoading) {
    return (
      <Dimmer active>
        <Loader indeterminate>Loading Data</Loader>
      </Dimmer>
    )
  }
  return (
    <Grid stackable stretched>
      <Grid.Row>
        <Grid.Column>
          <Header as='h2'>
            <Icon name='bar chart' />
            <Header.Content>
            Summary of all classes
            </Header.Content>
          </Header>
          <Table celled striped unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Class Name</Table.HeaderCell>
                <Table.HeaderCell>Student No.</Table.HeaderCell>
                <Table.HeaderCell>Student Attendance</Table.HeaderCell>
                <Table.HeaderCell>User No.</Table.HeaderCell>
                <Table.HeaderCell>User Attendance</Table.HeaderCell>
                <Table.HeaderCell>Student-Tutor Ratio</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {summaryData.map((options, index) => (
                <Table.Row key={`class-${index}`}>
                  <Table.Cell collapsing><Link to={'/dashboard/classes/id/' + options.id}>{options.className}</Link></Table.Cell>
                  <Table.Cell collapsing>{options.studentNumber}</Table.Cell>
                  <Table.Cell collapsing>{options.studentsPercentage * 100}%</Table.Cell>
                  <Table.Cell collapsing>{options.userNumber}</Table.Cell>
                  <Table.Cell collapsing>{options.usersPercentage * 100}%</Table.Cell>
                  <Table.Cell collapsing>{options.STRatio}</Table.Cell>
                </Table.Row>))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default AttendanceSummary
