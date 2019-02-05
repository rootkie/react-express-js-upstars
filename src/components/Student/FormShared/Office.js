import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

const Office = ({dispatch, admin}) => {
  const { adminNotes, interviewDate, interviewNotes, commencementDate, exitDate, exitReason } = admin
  return (
    <Segment attached='bottom'>
      <Form.Field>
        <label>Interview date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='DD/MM/YYYY'
          selected={interviewDate}
          onChange={date => dispatch({type: 'updateField'})}
        />
      </Form.Field>
      <Form.Input label='Interview notes' placeholder='reason for acceptance' name='admin-interviewNotes' value={interviewNotes} onChange={this.handleChange} />
      <Form.Field>
        <label>Commencement date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='DD/MM/YYYY'
          showMonthDropdown
          dropdownMode='select'
          minDate={interviewDate}
          selected={commencementDate}
          onChange={this.handleDateChange('admin-commencementDate')}
        />
      </Form.Field>
      <Form.Input label='Admin notes' placeholder='up to 1000 words' name='admin-adminNotes' value={adminNotes} onChange={this.handleChange} />
      <Form.Field>
        <label>Date of exit</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='DD/MM/YYYY'
          showMonthDropdown
          showYearDropdown
          dropdownMode='select'
          minDate={commencementDate}
          selected={exitDate}
          onChange={this.handleDateChange('admin-exitDate')}
        />
      </Form.Field>
      <Form.Input label='Reason for exit' placeholder='reason for exit' name='admin-exitReason' value={exitReason} onChange={this.handleChange} />
    </Segment>
  )
}

Office.propTypes = {
  dispatch: PropTypes.func.isRequired,
  admin: PropTypes.object.isRequired
}

export default Office
