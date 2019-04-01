import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'

const Office = ({admin, dispatch, edit}) => {
  const handleAdminChange = (e, {name, value}) => {
    if (edit) {
      dispatch({type: 'updateAdminField', name, value})
    }
  }

  const { adminNotes, interviewDate, interviewNotes, commencementDate, exitDate, exitReason } = admin
  return (
    <Segment attached='bottom' color='orange'>
      <Form.Field>
        <label>Interview date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='DD/MM/YYYY'
          selected={interviewDate}
          onChange={date => { if (edit) dispatch({type: 'updateAdminField', name: 'interviewDate', value: date}) }}
        />
      </Form.Field>
      <Form.Input label='Interview notes' placeholder='reason for acceptance' name='interviewNotes' value={interviewNotes} onChange={handleAdminChange} />
      <Form.Field>
        <label>Commencement date</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='DD/MM/YYYY'
          showMonthDropdown
          dropdownMode='select'
          minDate={interviewDate}
          selected={commencementDate}
          onChange={date => { if (edit) dispatch({type: 'updateAdminField', name: 'commencementDate', value: date}) }}
        />
      </Form.Field>
      <Form.Input label='Admin notes' placeholder='up to 1000 words' name='adminNotes' value={adminNotes} onChange={handleAdminChange} />
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
          onChange={date => { if (edit) dispatch({type: 'updateAdminField', name: 'exitDate', value: date}) }}
        />
      </Form.Field>
      <Form.Input label='Reason for exit' placeholder='reason for exit' name='exitReason' value={exitReason} onChange={handleAdminChange} />
    </Segment>
  )
}

Office.propTypes = {
  dispatch: PropTypes.func.isRequired,
  admin: PropTypes.object.isRequired,
  edit: PropTypes.bool.isRequired
}

export default Office
