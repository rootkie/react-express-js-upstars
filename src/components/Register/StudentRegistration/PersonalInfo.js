import React from 'react'
import { Form, Button, Table, Icon, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const genderOptions = [
  { key: 'm', text: 'Male', value: 'M' },
  { key: 'f', text: 'Female', value: 'F' }
]

const PersonalInfo = ({dispatch, state, handleChange, updateAcademic}) => {
  const { name, icNumber, dob, address, gender, nationality, classLevel, schoolName, academicInfo } = state

  return (
    <Segment attached='bottom' color='red'>
      {/* <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='name' value={name} onChange={(e, {value, name}) => dispatch({type: 'updateProfile', value, name})} required /> */}
      <Form.Input label='Name of Student' placeholder='as in Birth Certificate / Student card' name='name' value={name} onChange={handleChange} required />
      <Form.Group widths='equal'>
        <Form.Input label='Student Identity card no' placeholder='Student Identity card no' name='icNumber' value={icNumber} onChange={handleChange} required />
        <Form.Field required>
          <label>Date of Birth</label>
          <DatePicker
            placeholderText='Click to select a date'
            dateFormat='DD/MM/YYYY'
            maxDate={moment()}
            selected={dob}
            onChange={date => dispatch({type: 'updateField', name: 'dob', value: date})}
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
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
                <Form.Input type='number' transparent key={`year-${i}`} name={`year-${i}`} value={info.year} placeholder='Year' onChange={updateAcademic(i, 'year')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`term-${i}`} name={`term-${i}`} value={info.term} placeholder='Term' onChange={updateAcademic(i, 'term')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`english-${i}`} name={`english-${i}`} value={info.english} placeholder='English' onChange={updateAcademic(i, 'english')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`math-${i}`} name={`math-${i}`} value={info.math} placeholder='Maths' onChange={updateAcademic(i, 'math')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`motherTongue-${i}`} name={`motherTongue-${i}`} value={info.motherTongue} placeholder='MotherTongue' onChange={updateAcademic(i, 'motherTongue')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`science-${i}`} name={`science-${i}`} value={info.science} placeholder='Science' onChange={updateAcademic(i, 'science')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`overall-${i}`} name={`overall-${i}`} value={info.overall} placeholder='Overall' onChange={updateAcademic(i, 'overall')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button floated='right' icon labelPosition='left' primary size='small' type='button' onClick={() => dispatch({type: 'incrementAcademic'})}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' type='button' onClick={() => dispatch({type: 'decrementAcademic'})}>
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
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  updateAcademic: PropTypes.func.isRequired
}
export default PersonalInfo
