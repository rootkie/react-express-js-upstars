import React from 'react'
import { Form, Button, Table, Icon, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const citizenshipOptions = [
  { key: 'citizen', text: 'Singapore Citizen', value: 'citizen' },
  { key: 'pr', text: 'Singapore PR', value: 'pr' },
  { key: 'other', text: 'Other', value: 'other' }
]

const fasOptions = [
  { key: 'fsc', text: 'Family Service Centre', value: 'FSC' },
  { key: 'moe', text: 'MOE', value: 'MOE' },
  { key: 'mendaki', text: 'Mendaki', value: 'Mendaki' }
]

const tuitionOptions = [
  {value: 'CDAC', text: 'CDAC'},
  {value: 'Mendaki', text: 'Mendaki'},
  {value: 'Private', text: 'Private'}
]

const FamilyDetails = ({dispatch, state, handleChange}) => {
  const { father, mother, otherFamily, misc, tuitionChoices } = state
  const { fas, fscName } = misc

  const updateFamily = (index, property) => (e, {value}) => {
    e.preventDefault()
    dispatch({type: 'updateFamily', index, property, value})
  }

  return (
    <Segment attached='bottom'>
      {/* Father's information */}
      <Form.Input label="Father's name" placeholder='as in IC card' name='father-name' value={father.name} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label='Identification Card Number' placeholder='IC number' name='father-icNumber' value={father.icNumber} onChange={handleChange} />
        <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='father-nationality' value={father.nationality} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Email' placeholder='email' type='email' name='father-email' value={father.email} onChange={handleChange} />
        <Form.Input type='number' label='Mobile number' placeholder='Mobile number' name='father-contactNumber' value={father.contactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='father-occupation' value={father.occupation} onChange={handleChange} />
        <Form.Input type='number' label='Monthly Income' placeholder='Monthly Income' name='father-income' value={father.income} onChange={handleChange} />
      </Form.Group>

      {/* Mother's information */}
      <Form.Input label="Mother's name" placeholder='as in IC card' name='mother-name' value={mother.name} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label='Identification Card Number' placeholder='IC number' name='mother-icNumber' value={mother.icNumber} onChange={handleChange} />
        <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='mother-nationality' value={mother.nationality} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Email' placeholder='email' type='email' name='mother-email' value={mother.email} onChange={handleChange} />
        <Form.Input type='number' label='Mobile number' placeholder='Mobile number' name='mother-contactNumber' value={mother.contactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='mother-occupation' value={mother.occupation} onChange={handleChange} />
        <Form.Input type='number' label='Monthly Income' placeholder='Monthly Income' name='mother-income' value={mother.income} onChange={handleChange} />
      </Form.Group>

      {/* adding additional family members */}
      <Table celled striped columns={3} fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>Other family members in the same household</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Relationship</Table.HeaderCell>
            <Table.HeaderCell>Age</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {otherFamily.map((member, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={otherFamily[i].name} placeholder='Name' onChange={updateFamily(i, 'name')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={otherFamily[i].relationship} placeholder='Relationship' onChange={updateFamily(i, 'relationship')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`age-${i}`} name={`age-${i}`} value={otherFamily[i].age} placeholder='Age' onChange={updateFamily(i, 'age')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={dispatch({type: 'incFamily'})}>
                <Icon name='user' /> Add Member
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={dispatch({type: 'decFamily'})} >
                <Icon name='user' /> Remove Member
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='misc-fas' value={fas} onChange={handleChange} multiple />
      {fas.includes('FSC') && <Form.Input label='Name of Family Service Centre' placeholder='name of FSC' name='misc-fscName' value={fscName} onChange={handleChange} /> }
      <Form.Group inline>
        <label>Other Learning Support</label>
        {tuitionOptions.map((option, i) => {
          return (
            <Form.Checkbox label={option.text} key={`option-${i}`} name={`tuitionChoices-${option.value}`} onChange={handleChange} checked={tuitionChoices[option.value]} />
          )
        })}
      </Form.Group>
    </Segment>
  )
}

FamilyDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}

export default FamilyDetails
