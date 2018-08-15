import React, {Component} from 'react'
import { Table, Checkbox, Button, Icon, Confirm, Dimmer, Loader, Header, Grid } from 'semantic-ui-react'
import { array, func, bool } from 'prop-types'
import { Link } from 'react-router-dom'

// Special CSS to implement !important to fix SemanticUI compatibility issues
const inlineStyle = {
  confirm: {
    marginTop: '1rem auto !important',
    margin: '1rem auto'
  }
}

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
        <Grid stretched stackable>
          <Grid.Row>
            <Grid.Column>
              <Header as='h3' dividing>Overview of all classes</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Table compact celled unstackable>
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
                  {classData.length > 0 && classData.map((Class, i) => (
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

                  {/* For class with no data sets */}
                  {classData.length === 0 &&
                  <Table.Row key={`class-1`}>
                    {roles.indexOf('SuperAdmin') !== -1 &&
                    <Table.Cell collapsing />
                    }
                    <Table.Cell collapsing>1</Table.Cell>
                    <Table.Cell>Oops! No Classes Found!</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                    <Table.Cell>nil</Table.Cell>
                  </Table.Row>}
                </Table.Body>
                <Table.Footer fullWidth>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='6'>
                      {roles.indexOf('SuperAdmin') !== -1 &&
                      <div>
                        <Link to='/dashboard/classes/add'>
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
                          style={inlineStyle.confirm}
                        />
                      </div>
                      }
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
  }
}

export default ClassView
