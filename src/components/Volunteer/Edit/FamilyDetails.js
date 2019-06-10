import React from 'react'
import { Form, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const FamilyDetails = ({ state, handleChange }) => {
  const { fatherName, fatherOccupation, fatherEmail, motherName, motherOccupation, motherEmail, hobbies, careerGoal } = state
  return (
    <Segment attached='bottom' color='blue'>
      <Form.Group widths='equal'>
        <Form.Input label="Father's name" placeholder="Father's name" name='fatherName' value={fatherName} onChange={handleChange} />
        <Form.Input label="Father's occupation" placeholder="Father's occupation" name='fatherOccupation' value={fatherOccupation} onChange={handleChange} />
      </Form.Group>
      <Form.Input label="Father's email" type='email' placeholder="Father's email" name='fatherEmail' value={fatherEmail} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label="Mother's name" placeholder="Mother's name" name='motherName' value={motherName} onChange={handleChange} />
        <Form.Input label="Mother's occupation" placeholder="Mother's occupation" name='motherOccupation' value={motherOccupation} onChange={handleChange} />
      </Form.Group>
      <Form.Input label="Mother's email" type='email' placeholder="Mother's email" name='motherEmail' value={motherEmail} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.TextArea rows={3} label='Your Hobbies' placeholder='Your Hobbies' name='hobbies' value={hobbies} onChange={handleChange} />
        <Form.TextArea rows={3} label='Career Goal' name='careerGoal' placeholder='Your dream job' value={careerGoal} onChange={handleChange} />
      </Form.Group>
    </Segment>
  )
}

FamilyDetails.propTypes = {
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}
export default FamilyDetails
