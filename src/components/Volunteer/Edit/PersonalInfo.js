import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

const timeSlotOptions = [
  { value: 'Monday 7-9.30pm', text: 'Monday 7-9.30pm' },
  { value: 'Tuesday 7-9.30pm', text: 'Tuesday 7-9.30pm' },
  { value: 'Wednesday 7-9.30pm', text: 'Wednesday 7-9.30pm' },
  { value: 'Thursday 7-9.30pm', text: 'Thursday 7-9.30pm' },
  { value: 'Friday 7-9.30pm', text: 'Friday 7-9.30pm' },
  { value: 'Saturday 10-12.30pm', text: 'Saturday 10-12.30pm' },
  { value: 'Saturday 12.15-1.15pm', text: 'Saturday 12.15-1.15pm' },
  { value: 'Saturday 12.00-2.30pm', text: 'Saturday 12.00-2.30pm' }
]

const PersonalInfo = ({ state, handleChange, dispatch }) => {
  const handleChangeCheckBox = (e, { name, checked }) => {
    if (state.edit) {
      const newTimeSlot = {
        ...state.preferredTimeSlot,
        [name]: checked
      }
      dispatch({ type: 'updateField', name: 'preferredTimeSlot', value: newTimeSlot })
    }
  }

  /*
  ==============
  RENDER
  ==============
  */
  const { name, dob, nric, gender, address, postalCode, handphone, homephone, schoolLevel, schoolClass, commencementDate, exitDate, preferredTimeSlot, edit } = state
  return (
    <Segment attached='bottom' color='red'>
      <Form.Group widths='equal'>
        <Form.Input label='Name' placeholder='Name' name='name' value={name} readOnly required />
        <Form.Input label='Gender' placeholder='Gender' name='gender' value={gender === 'M' ? 'Male' : 'Female'} readOnly required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Field required>
          <label>Date of Birth</label>
          <DatePicker
            dateFormat='dd/MM/yyyy'
            selected={dob}
            readOnly
            required />
        </Form.Field>
        <Form.Input label='NRIC' placeholder='NRIC' name='nric' value={nric} readOnly required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Address' placeholder='Address' name='address' value={address} onChange={handleChange} required />
        <Form.Input label='Postal code' placeholder='Postal code' name='postalCode' value={postalCode} onChange={handleChange} type='number' required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='School level' placeholder='Sec 1 / JC 2' name='schoolLevel' value={schoolLevel} onChange={handleChange} required />
        <Form.Input label='Class name' placeholder='class name' name='schoolClass' value={schoolClass} onChange={handleChange} required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Mobile number' placeholder='Mobile number' name='handphone' value={handphone} onChange={handleChange} type='number' required />
        <Form.Input label='Home tel' placeholder='Home tel' name='homephone' value={homephone} onChange={handleChange} required type='number' />
      </Form.Group>
      <Form.Field>
        <label>Intended Date of Exit</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='dd/MM/yyyy'
          showMonthDropdown
          showYearDropdown
          dropdownMode='select'
          selected={exitDate}
          onChange={date => { if (edit) dispatch({ type: 'updateField', name: 'exitDate', value: date }) }}
          minDate={commencementDate}
          required />
      </Form.Field>

      <Form.Group inline>
        <label>Date of Preferred Time Slot *</label>
        {timeSlotOptions.map((option, i) => {
          return (
            <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={handleChangeCheckBox} checked={preferredTimeSlot[option.value]} />
          )
        })}
      </Form.Group>
    </Segment>
  )
}

PersonalInfo.propTypes = {
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default PersonalInfo
