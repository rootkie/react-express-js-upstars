import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Link, Dropdown, Confirm } from 'semantic-ui-react'
import axios from 'axios'

axios.defaults.baseURL = 'https://test.rootkiddie.com/api/'

class ClassView extends Component {
  
  constructor(props) {
    super()
    // This is probably where to get all the necessary data from server api
    this.state = {
      selected: [],
      classData: []
    }
    this.getClasses()
  }

  getClasses = () => {
    axios.get('class')
      .then((response) => {
        this.setState({ classData: response.data.classes })
      })
      .catch((err) => {
        console.log(err)
      })
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
    console.log(this.state.selected)
  }

  render() {
    const { classData, selected } = this.state
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
              <Button size='small' negative>Delete</Button>
              <Button size='small' onClick={this.handleEdit}>Edit</Button>
              <Confirm />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>

        
      </Table>
    )
  }
}

export default ClassView
