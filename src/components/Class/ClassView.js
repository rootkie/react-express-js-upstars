import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Confirm, Dimmer, Loader, Header } from 'semantic-ui-react'
import { array, func, bool } from 'prop-types'
import { Link } from 'react-router-dom'

// Check the type of props are in the correct forms
class ClassView extends Component {
  static propTypes = {
    classData: array.isRequired,
    stopClass: func,
    isLoading: bool,
    roles: array.isRequired
  }

  state = {
    selected: [],
    deleteConfirmationVisibility: false
  }

  // Either push or filter that array classID off the deletion list
  handleCheckBox = (e, { name: _id, checked }) => { // name here is actually class _id
    let { selected } = this.state
    console.log(selected)
    if (checked) {
      selected.push(_id)
    } else {
      selected = selected.filter(element => element !== _id)
    }
    this.setState({selected})
  }

  handleStop = () => {
    const { stopClass } = this.props
    const { selected } = this.state
    selected.length > 0 && stopClass(selected) // check if non empty selected
    this.setState({ selected: [] })
  }

  handleStoppingConfirmation = (option) => () => {
    switch (option) {
      case 'show':
        this.setState({deleteConfirmationVisibility: true})
        break
      case 'confirm':
        this.handleStop()
        // break omitted
      case 'cancel': // eslint-disable-line
        this.setState({deleteConfirmationVisibility: false})
        break
      default:
    }
  }

  render () {
    const { selected, deleteConfirmationVisibility } = this.state
    const { classData, isLoading, roles } = this.props
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
        <div>
          <Header as='h3' dividing>Overview of all classes</Header>
          <Table compact celled>
            <Table.Header>
              <Table.Row>
                {roles.indexOf('SuperAdmin') !== -1 &&
                <Table.HeaderCell />
                }
                <Table.HeaderCell>S/N</Table.HeaderCell>
                <Table.HeaderCell>Class Name</Table.HeaderCell>
                <Table.HeaderCell>ClassType</Table.HeaderCell>
                <Table.HeaderCell>Day and Time</Table.HeaderCell>
                <Table.HeaderCell>Venue</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {classData.map((Class, i) => (
                <Table.Row key={`class-${i}`}>
                  {roles.indexOf('SuperAdmin') !== -1 &&
                  <Table.Cell collapsing>
                    <Checkbox name={Class._id} onChange={this.handleCheckBox} checked={selected.includes(Class._id)} />
                  </Table.Cell>
                  }
                  <Table.Cell collapsing>{i + 1}</Table.Cell>
                  <Table.Cell>
                    <Link to={'id/' + Class._id}>{Class.className}</Link>
                  </Table.Cell>
                  <Table.Cell>{Class.classType}</Table.Cell>
                  <Table.Cell>{Class.dayAndTime}</Table.Cell>
                  <Table.Cell>{Class.venue}</Table.Cell>
                  <Table.Cell>{Class.status}</Table.Cell>
                </Table.Row>))}
            </Table.Body>
            <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan='6'>
                  {roles.indexOf('SuperAdmin') !== -1 &&
                  <div>
                    <Link to='/classes/add'>
                      <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                        <Icon name='group' />New Class
                      </Button>
                    </Link>
                    <Button size='small' negative onClick={this.handleStoppingConfirmation('show')} disabled={selected.length === 0}>Stop</Button>
                    <Confirm
                      open={deleteConfirmationVisibility}
                      header='Stopping the following classes:'
                      content={selected.map((id) => (
                        classData.filter((aClass) => (aClass._id === id))[0].className
                      )).join(', ')}
                      onCancel={this.handleStoppingConfirmation('cancel')}
                      onConfirm={this.handleStoppingConfirmation('confirm')}
                    />
                  </div>
                  }
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>

          </Table>
        </div>
      )
    }
  }
}

export default ClassView
