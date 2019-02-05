import React from 'react'
import { Form, Button, Table, Icon, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'M' },
  { key: 'f', text: 'Female', value: 'F' }
]

const PersonalInfo = ({profile, academicInfo, dispatch, handleChange}) => {
  const { name, icNumber, dob, address, gender, nationality, classLevel, schoolName } = profile

  const handleAcademic = (index, property) => (e, {value}) => {
    e.preventDefault()
    dispatch({type: 'updateAcademic', index, property, value})
  }

  return (
    <Segment attached='bottom'>
      <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='profile-name' value={name} onChange={handleChange} required />
      <Form.Group widths='equal'>
        <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='profile-icNumber' value={icNumber} onChange={handleChange} required />
        <Form.Field required>
          <label>Date of Birth</label>
          <DatePicker
            placeholderText='Click to select a date'
            dateFormat='DD/MM/YYYY'
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
            maxDate={moment()}
            selected={dob}
            onChange={date => dispatch({type: 'updateField', name: 'profile.dob', value: date})}
            required />
        </Form.Field>
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Nationality' placeholder='Nationality' name='profile-nationality' value={nationality} onChange={handleChange} required />
        <Form.Select label='Gender' options={genderOptions} placeholder='Select Gender' name='profile-gender' value={gender} onChange={handleChange} required />
      </Form.Group>
      <Form.Input label='Residential address' placeholder='Residential address' name='profile-address' value={address} onChange={handleChange} required />
      <Form.Group widths='equal'>
        <Form.Input label='Name of School' placeholder='Name of School' name='profile-schoolName' value={schoolName} onChange={handleChange} required />
        <Form.Input label='Class Level' placeholder='e.g. Primary 1' name='profile-classLevel' value={classLevel} onChange={handleChange} required />
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
          {academicInfo.map((year, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Input type='number' transparent key={`year-${i}`} name={`year-${i}`} value={academicInfo[i].year} placeholder='Year' onChange={handleAcademic(i, 'year')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`term-${i}`} name={`term-${i}`} value={academicInfo[i].term} placeholder='Term' onChange={handleAcademic(i, 'term')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`english-${i}`} name={`english-${i}`} value={academicInfo[i].english} placeholder='English' onChange={handleAcademic(i, 'english')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`math-${i}`} name={`math-${i}`} value={academicInfo[i].math} placeholder='Maths' onChange={handleAcademic(i, 'math')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`motherTongue-${i}`} name={`motherTongue-${i}`} value={academicInfo[i].motherTongue} placeholder='MotherTongue' onChange={handleAcademic(i, 'motherTongue')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`science-${i}`} name={`science-${i}`} value={academicInfo[i].science} placeholder='Science' onChange={handleAcademic(i, 'science')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`overall-${i}`} name={`overall-${i}`} value={academicInfo[i].overall} placeholder='Overall' onChange={handleAcademic(i, 'overall')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={dispatch({type: 'incAcademic'})}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={dispatch({type: 'decAcademic'})}>
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
  profile: PropTypes.object.isRequired,
  academicInfo: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired
}
export default PersonalInfo
