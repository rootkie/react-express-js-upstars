import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Confirm, Dimmer, Loader } from 'semantic-ui-react'
import { array, func, object, bool } from 'prop-types'
import { Link } from 'react-router-dom'
import axios from 'axios'

class ClassView extends Component {
  static propTypes = {
    classData: array.isRequired,
    deleteClass: func.isRequired,
    isLoading: bool
  }

  static contextTypes = {
    router: object
  }

  state = {
    selected: [],
    deleteConfirmationVisibility: false
  }

  handleCheckBox = (e, { name: _id, checked }) => { // name here is actually class _id
    let { selected } = this.state
    if (checked) {
      selected.push(_id)
    } else {
      selected = selected.filter((element) => element !== _id)
    }
    this.setState({selected})
  }

  handleEdit = () => {
    const { selected } = this.state
    if (selected.length === 1) {
      const toEditId = selected[0]
      this.context.router.history.push(`/classes/edit/${toEditId}`)
    }
  }

  handleDelete = () => {
    const { deleteClass } = this.props
    const { selected } = this.state
    selected.length > 0 && deleteClass(selected) // check if non empty selected
    this.setState({ selected: [] })
  }

  handleDeleteConfirmation = (option) => () => {
    switch (option) {
      case 'show':
        this.setState({deleteConfirmationVisibility: true})
        break
      case 'confirm':
        this.handleDelete()
        // break omitted
      case 'cancel': // eslint-disable-line
        this.setState({deleteConfirmationVisibility: false})
        break
      default:
    }
  }

  render () {
    const { selected, deleteConfirmationVisibility } = this.state
    const { classData, isLoading } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
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
                <Link to='/classes/add'>
                  <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                    <Icon name='group' />New Class
                </Button>
                </Link>
                <Button size='small' negative onClick={this.handleDeleteConfirmation('show')} disabled={selected.length === 0} >Delete</Button>
                <Button size='small' onClick={this.handleEdit} disabled={selected.length !== 1} >Edit</Button>
                <Confirm
                  open={deleteConfirmationVisibility}
                  header='Deleting the following classes:'
                  content={selected.map((id) => (
                  classData.filter((aClass) => (aClass._id === id))[0].className
                )).join(', ')}
                  onCancel={this.handleDeleteConfirmation('cancel')}
                  onConfirm={this.handleDeleteConfirmation('confirm')}
        />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>

        </Table>
      )
    }
  }
}

export default ClassView
