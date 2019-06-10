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
  { value: 'CDAC', text: 'CDAC' },
  { value: 'Mendaki', text: 'Mendaki' },
  { value: 'Private', text: 'Private' }
]

const FamilyDetails = ({ dispatch, state, handleChange, edit }) => {
  const { otherFamily, tuitionChoices, fas, fsc,
    fatherName, fatherIcNumber, fatherNationality, fatherContactNumber, fatherEmail, fatherOccupation, fatherIncome,
    motherName, motherIcNumber, motherNationality, motherContactNumber, motherEmail, motherOccupation, motherIncome } = state

  const updateFamily = (index, property) => (e, { value }) => {
    e.preventDefault()
    if (edit) {
      dispatch({ type: 'updateFamily', index, property, value })
    }
  }

  return (
    <Segment attached='bottom' color='blue'>
      {/* Father's information */}
      <Form.Input label="Father's name" placeholder='as in IC card' name='fatherName' value={fatherName} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label='Identification Card Number' placeholder='IC number' name='fatherIcNumber' value={fatherIcNumber} onChange={handleChange} />
        <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='fatherNationality' value={fatherNationality} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Email' placeholder='email' type='email' name='fatherEmail' value={fatherEmail} onChange={handleChange} />
        <Form.Input type='string' label='Mobile number' placeholder='Mobile number' name='fatherContactNumber' value={fatherContactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='fatherOccupation' value={fatherOccupation} onChange={handleChange} />
        <Form.Input type='string' label='Monthly Income' placeholder='Monthly Income' name='fatherIncome' value={fatherIncome} onChange={handleChange} />
      </Form.Group>

      {/* Mother's information */}
      <Form.Input label="Mother's name" placeholder='as in IC card' name='motherName' value={motherName} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label='Identification Card Number' placeholder='IC number' name='motherIcNumber' value={motherIcNumber} onChange={handleChange} />
        <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='motherNationality' value={motherNationality} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Email' placeholder='email' type='email' name='motherEmail' value={motherEmail} onChange={handleChange} />
        <Form.Input type='string' label='Mobile number' placeholder='Mobile number' name='motherContactNumber' value={motherContactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='motherOccupation' value={motherOccupation} onChange={handleChange} />
        <Form.Input type='string' label='Monthly Income' placeholder='Monthly Income' name='motherIncome' value={motherIncome} onChange={handleChange} />
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
                <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={member.name} placeholder='Name' onChange={updateFamily(i, 'name')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={member.relationship} placeholder='Relationship' onChange={updateFamily(i, 'relationship')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`age-${i}`} name={`age-${i}`} value={member.age} placeholder='Age' onChange={updateFamily(i, 'age')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>
              <Button type='button' floated='right' icon labelPosition='left' primary size='small' onClick={() => { if (edit) dispatch({ type: 'incFamily' }) }}>
                <Icon name='user' /> Add Member
              </Button>
              <Button type='button' floated='right' icon labelPosition='left' negative size='small' onClick={() => { if (edit) dispatch({ type: 'decFamily' }) }}>
                <Icon name='user' /> Remove Member
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Form.Select label='Financial Assistance Scheme' options={fasOptions} placeholder='FAS' name='fas' value={fas} onChange={handleChange} multiple />
      {fas.includes('FSC') && <Form.Input label='Name of Family Service Centre' placeholder='name of FSC' name='fsc' value={fsc} onChange={handleChange} /> }
      <Form.Group inline>
        <label>Other Learning Support</label>
        {tuitionOptions.map((option, i) => {
          return (
            <Form.Checkbox label={option.text} key={`option-${i}`} name={`${option.value}`} onChange={(e, { name, checked }) => { if (edit) dispatch({ type: 'updateTuition', name, checked }) }} checked={tuitionChoices[option.value]} />
          )
        })}
      </Form.Group>
    </Segment>
  )
}

FamilyDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  edit: PropTypes.bool.isRequired
}

export default FamilyDetails
