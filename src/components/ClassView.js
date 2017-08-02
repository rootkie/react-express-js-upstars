import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Link, Dropdown, Confirm } from 'semantic-ui-react'
import { array, func } from 'prop-types'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class ClassView extends Component {
  static propTypes = {
    classData: array.isRequired,
    deleteClass: func.isRequired
  }

  constructor (props) {
    super(props)
    // This is probably where to get all the necessary data from server api
    console.log(this.props.classData)
    this.state = {
      selected: [],
      classData: []
    }
  }

  handleCheckBox = (e, { name, checked }) => {
    let { selected } = this.state
    if (checked) {
      selected.push(name) // name here is actually class _id
    } else {
      selected = selected.filter((element) => element !== name)
    }
    this.setState({selected})
  }

  handleEdit = () => {
    console.log(this.state.selected)
  }

  handleDelete = () => {
    const { deleteClass } = this.props
    const { selected } = this.state
    // Delete the first choice only. Until multi delete is implemented
    deleteClass(selected)
    this.setState({ selected: [] })
  }

  render () {
    const { selected } = this.state
    const { classData } = this.props
    return (
      <Table compact celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Class Name</Table.HeaderCell>
            <Table.HeaderCell>classType</Table.HeaderCell>
            <Table.HeaderCell>Day and Time</Table.HeaderCell>
            <Table.HeaderCell>venue</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {classData.map((Class, i) => (
            <Table.Row key={`class-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={Class._id} onChange={this.handleCheckBox} checked={selected.includes(Class._id)} />
              </Table.Cell>
              <Table.Cell>{Class.className}</Table.Cell>
              <Table.Cell>{Class.classType}</Table.Cell>
              <Table.Cell>{Class.dayAndTime}</Table.Cell>
              <Table.Cell>{Class.venue}</Table.Cell>
            </Table.Row>))}
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell colSpan='4'>
              <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                <Icon name='group' />New Class
              </Button>
              <Button size='small' negative onClick={this.handleDelete} disabled={selected.length === 0} >Delete</Button>
              <Button size='small' onClick={this.handleEdit} disabled={selected.length !== 1} >Edit</Button>
              <Confirm />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>

      </Table>
    )
  }
}

export default ClassView
