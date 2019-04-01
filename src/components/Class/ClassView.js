import React, { useReducer } from 'react'
import { Table, Checkbox, Button, Icon, Confirm, Dimmer, Loader, Header, Grid } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const initialState = {
  selected: [],
  deleteConfirmationVisibility: false
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateSelection':
      return {
        ...state,
        selected: action.newSelection
      }
    case 'reset':
      return {
        ...initialState
      }
    case 'showDelete':
      return {
        ...state,
        deleteConfirmationVisibility: true
      }
    case 'closeDelete':
      return {
        ...state,
        deleteConfirmationVisibility: false
      }
    default:
      return state
  }
}

const ClassView = ({classData, stopClass, isLoading, roles}) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  /*
  ==============
  FUNCTIONS
  ==============
  */
  const handleCheckBox = (e, { name: _id, checked }) => { // name here is actually class _id
    const { selected } = state
    const newSelection = checked ? [...selected, _id] : selected.filter(element => element !== _id)
    dispatch({type: 'updateSelection', newSelection})
  }

  const handleStop = async () => {
    const { selected } = state
    selected.length > 0 && await stopClass(selected) // check if non empty selected
    dispatch({type: 'reset'})
  }

  const handleStoppingConfirmation = (option) => async e => {
    e.preventDefault()
    switch (option) {
      case 'show':
        dispatch({type: 'showDelete'})
        break
      case 'confirm':
        await handleStop()
        break
      case 'cancel':
        dispatch({type: 'closeDelete'})
        break
      default:
    }
  }

  /*
  ===================
  RENDER
  ===================
  */

  const { selected, deleteConfirmationVisibility } = state
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
                  <Table.Row key={`class-${i}`} negative={Class.status === 'Stopped'}>
                    {roles.indexOf('SuperAdmin') !== -1 &&
                      <Table.Cell collapsing>
                        <Checkbox name={Class._id} onChange={handleCheckBox} checked={selected.includes(Class._id)} />
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
                        <Button size='small' negative onClick={handleStoppingConfirmation('show')} disabled={selected.length === 0}>
                        Stop
                        </Button>
                        <Confirm
                          open={deleteConfirmationVisibility}
                          header='Stopping the following classes:'
                          content={selected.map((id) => (
                            classData.filter((aClass) => (aClass._id === id))[0].className
                          )).join(', ')}
                          onCancel={handleStoppingConfirmation('cancel')}
                          onConfirm={handleStoppingConfirmation('confirm')}
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

ClassView.propTypes = {
  classData: PropTypes.array.isRequired,
  stopClass: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  roles: PropTypes.array.isRequired
}

export default ClassView
