import React from 'react'
import { Table, Header } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const ClassView = ({classes}) => {
  return (
    <React.Fragment>
      <Header as='h3' dividing>Classes</Header>
      <Table compact celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='1'>S/N</Table.HeaderCell>
            <Table.HeaderCell width='6'>Name</Table.HeaderCell>
            <Table.HeaderCell width='5'>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {classes.length !== 0 &&
        <Table.Body>
          {classes.map((Class, i) => (
            <Table.Row key={Class._id}>
              <Table.Cell>{i + 1}</Table.Cell>
              <Table.Cell><Link to={`/dashboard/classes/id/${Class._id}`}>{Class.className}</Link></Table.Cell>
              <Table.Cell>{Class.status}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        }
        {classes.length === 0 &&
        <Table.Body>
          <Table.Row key={'empty-class'}>
            <Table.Cell>1</Table.Cell>
            <Table.Cell>Oops! No classes found!</Table.Cell>
            <Table.Cell>nil</Table.Cell>
          </Table.Row>
        </Table.Body>
        }
      </Table>
    </React.Fragment>
  )
}

ClassView.propTypes = {
  classes: PropTypes.array.isRequired
}

export default ClassView
