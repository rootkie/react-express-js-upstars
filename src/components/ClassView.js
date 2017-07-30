import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Link, Dropdown, Confirm } from 'semantic-ui-react'

const classData = [
  {_id: '1', className:'test', dayAndTime: 'monday 9pm', venue:'somewhere', classType: 'Tuition'},
  {_id: '2', className:'test2', dayAndTime: 'monday 9pm', venue:'somewhere', classType: 'Tuition'},
  {_id: '3', className:'test3', dayAndTime: 'monday 9pm', venue:'somewhere', classType: 'Tuition'},
]

class ClassView extends Component {
  state = {
    classData
  }

  render() {
    const {classData} = this.state
    return (
      <Table compact celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Class Name</Table.HeaderCell>
            <Table.HeaderCell>Day and Time</Table.HeaderCell>
            <Table.HeaderCell>venue</Table.HeaderCell>
            <Table.HeaderCell>classType</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {classData.map((Class, i) => (
            <Table.Row key={`class-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={Class._id} />
              </Table.Cell>
              <Table.Cell>{Class.className}</Table.Cell>
              <Table.Cell>{Class.dayAndTime}</Table.Cell>
              <Table.Cell>{Class.venue}</Table.Cell>
              <Table.Cell>{Class.classType}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell colSpan='4'>
              <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                <Icon name='group' />New Class
              </Button>
              <Button size='small' negative>Delete</Button>
              <Button size='small'>Edit</Button>
              <Confirm />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>

        
      </Table>
    )
  }
}

export default ClassView
