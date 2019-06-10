import React from 'react'
import { Form, Button, Table, Icon, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'M' },
  { key: 'f', text: 'Female', value: 'F' }
]

const statusOptions = [
  { key: 'active', text: 'Active', value: 'Active' },
  { key: 'deleted', text: 'Deleted', value: 'Deleted' },
  { key: 'suspended', text: 'Suspended', value: 'Suspended' }
]

const PersonalInfo = ({ state, dispatch, handleChange, edit, type }) => {
  const { name, icNumber, dob, address, gender, nationality, classLevel, schoolName, academicInfo, status } = state

  const handleAcademic = (index, property) => (e, { value }) => {
    e.preventDefault()
    if (edit) {
      dispatch({ type: 'updateAcademic', index, property, value })
    }
  }

  return (
    <Segment attached='bottom' color='red'>
      <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='name' value={name} onChange={handleChange} required />
      { type === 'edit' &&
      <Form.Select label='Status' options={statusOptions} placeholder='change status of student' name='status' value={status} onChange={handleChange} />
      }
      <Form.Group widths='equal'>
        <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='icNumber' value={icNumber} onChange={handleChange} readOnly={type === 'edit'} required />
        <Form.Field required>
          <label>Date of Birth</label>
          <DatePicker
            placeholderText='Click to select a date'
            dateFormat='dd/MM/yyyy'
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
            maxDate={new Date()}
            selected={dob}
            onChange={date => {
              if (edit) dispatch({ type: 'updateField', name: 'dob', value: date })
            }}
            required />
        </Form.Field>
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Nationality' placeholder='Nationality' name='nationality' value={nationality} onChange={handleChange} required />
        <Form.Select label='Gender' options={genderOptions} placeholder='Select Gender' name='gender' value={gender} onChange={handleChange} required />
      </Form.Group>
      <Form.Input label='Residential address' placeholder='Residential address' name='address' value={address} onChange={handleChange} required />
      <Form.Group widths='equal'>
        <Form.Input label='Name of School' placeholder='Name of School' name='schoolName' value={schoolName} onChange={handleChange} required />
        <Form.Input label='Class Level' placeholder='e.g. Primary 1' name='classLevel' value={classLevel} onChange={handleChange} required />
      </Form.Group>
      <Table celled striped columns={7} fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Year</Table.HeaderCell>
            <Table.HeaderCell>Term (1/2/3/4)</Table.HeaderCell>
            <Table.HeaderCell>English (%)</Table.HeaderCell>
            <Table.HeaderCell>Maths (%)</Table.HeaderCell>
            <Table.HeaderCell>Mother tongue (%)</Table.HeaderCell>
            <Table.HeaderCell>Science (%)</Table.HeaderCell>
            <Table.HeaderCell>OVERALL (%)</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {academicInfo.map((info, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Input type='number' transparent key={`year-${i}`} name={`year-${i}`} value={info.year} placeholder='Year' onChange={handleAcademic(i, 'year')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`term-${i}`} name={`term-${i}`} value={info.term} placeholder='Term' onChange={handleAcademic(i, 'term')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`english-${i}`} name={`english-${i}`} value={info.english} placeholder='English' onChange={handleAcademic(i, 'english')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`math-${i}`} name={`math-${i}`} value={info.math} placeholder='Maths' onChange={handleAcademic(i, 'math')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`motherTongue-${i}`} name={`motherTongue-${i}`} value={info.motherTongue} placeholder='MotherTongue' onChange={handleAcademic(i, 'motherTongue')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`science-${i}`} name={`science-${i}`} value={info.science} placeholder='Science' onChange={handleAcademic(i, 'science')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`overall-${i}`} name={`overall-${i}`} value={info.overall} placeholder='Overall' onChange={handleAcademic(i, 'overall')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button type='button' floated='right' icon labelPosition='left' primary size='small' onClick={() => { if (edit) dispatch({ type: 'incAcademic' }) }}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button type='button' floated='right' icon labelPosition='left' negative size='small' onClick={() => { if (edit) dispatch({ type: 'decAcademic' }) }}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Segment>
  )
}

PersonalInfo.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  edit: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired
}

export default PersonalInfo
