import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

const Office = ({ admin, dispatch, edit }) => {
  const handleAdminChange = (e, { name, value }) => {
    if (edit) {
      dispatch({ type: 'updateAdminField', name, value })
    }
  }

  const { commencementDate, interviewDate, interviewNotes, adminNotes } = admin
  return (
    <Segment attached='bottom' color='green'>
      <Form.Field>
        <label>Interview date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='dd/MM/yyyy'
          selected={interviewDate ? new Date(interviewDate) : undefined}
          onChange={date => { if (edit) dispatch({ type: 'updateAdminField', name: 'interviewDate', value: date }) }}
        />
      </Form.Field>
      <Form.TextArea rows={3} label='Interview notes' placeholder='reason for acceptance' name='interviewNotes' value={interviewNotes} onChange={handleAdminChange} />
      <Form.Field>
        <label>Commencement date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='dd/MM/yyyy'
          showMonthDropdown
          dropdownMode='select'
          minDate={interviewDate ? new Date(interviewDate) : undefined}
          selected={commencementDate ? new Date(commencementDate) : undefined}
          onChange={date => { if (edit) dispatch({ type: 'updateAdminField', name: 'commencementDate', value: date }) }}
        />
      </Form.Field>
      <Form.TextArea rows={3} label='Admin notes' placeholder='up to 1000 words' name='adminNotes' value={adminNotes} onChange={handleAdminChange} />
    </Segment>
  )
}

Office.propTypes = {
  admin: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  edit: PropTypes.bool.isRequired
}

export default Office
