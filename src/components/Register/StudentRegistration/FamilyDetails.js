import React from 'react'
import { Form, Button, Modal, Header, Table, Icon, Segment } from 'semantic-ui-react'
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

const FamilyDetails = ({ dispatch, state, handleChange, updateFamilyMember, recaptchaRef }) => {
  const {
    terms, termsDetails, otherFamily, tuitionChoices, fas, fsc,
    fatherName, fatherIcNumber, fatherNationality, fatherContactNumber, fatherEmail, fatherOccupation, fatherIncome,
    motherName, motherIcNumber, motherNationality, motherContactNumber, motherEmail, motherOccupation, motherIncome
  } = state

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
        <Form.Input type='String' label='Mobile number' placeholder='Mobile number' name='fatherContactNumber' value={fatherContactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='fatherOccupation' value={fatherOccupation} onChange={handleChange} />
        <Form.Input type='String' label='Monthly Income' placeholder='Monthly Income' name='fatherIncome' value={fatherIncome} onChange={handleChange} />
      </Form.Group>

      {/* Mother's information */}
      <Form.Input label="Mother's name" placeholder='as in IC card' name='motherName' value={motherName} onChange={handleChange} />
      <Form.Group widths='equal'>
        <Form.Input label='Identification Card Number' placeholder='IC number' name='motherIcNumber' value={motherIcNumber} onChange={handleChange} />
        <Form.Select label='Citizenship' options={citizenshipOptions} placeholder='Select Citizenship' name='motherNationality' value={motherNationality} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Email' placeholder='email' type='email' name='motherEmail' value={motherEmail} onChange={handleChange} />
        <Form.Input type='String' label='Mobile number' placeholder='Mobile number' name='motherContactNumber' value={motherContactNumber} onChange={handleChange} />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Occupation' placeholder='Occupation' name='motherOccupation' value={motherOccupation} onChange={handleChange} />
        <Form.Input type='String' label='Monthly Income' placeholder='Monthly Income' name='motherIncome' value={motherIncome} onChange={handleChange} />
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
                <Form.Input transparent key={`name-${i}`} name={`name-${i}`} value={member.name} placeholder='Name' onChange={updateFamilyMember(i, 'name')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`relationship-${i}`} name={`relationship-${i}`} value={member.relationship} placeholder='Relationship' onChange={updateFamilyMember(i, 'relationship')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input type='number' transparent key={`age-${i}`} name={`age-${i}`} value={member.age} placeholder='Age' onChange={updateFamilyMember(i, 'age')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>
              <Button floated='right' icon labelPosition='left' primary type='button' size='small' onClick={() => dispatch({ type: 'incrementFamilyMember' })}>
                <Icon name='user' /> Add Member
              </Button>
              <Button floated='right' icon labelPosition='left' negative type='button' size='small' onClick={() => dispatch({ type: 'decrementFamilyMember' })} >
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
            <Form.Checkbox label={option.text} key={`option-${i}`} name={`${option.value}`} onChange={(e, { name, checked }) => dispatch({ type: 'updateTuition', name, checked })} checked={tuitionChoices[option.value]} />
          )
        })}
      </Form.Group>
      {/* terms and conditions */}
      <Header as='h3'>Terms and Conditions</Header>
      <Form.Checkbox label={<label onClick={() => {
        recaptchaRef.current.execute()
        dispatch({ type: 'handleTermsOpen' })
      }}>I agree to the Terms and Conditions</label>} name='terms' required checked={terms} />

      <Modal open={termsDetails} dimmer='blurring' size='large'>
        <Modal.Header>Terms and conditions</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>Welcome to Ulu Pandan STARS</Header>
            <p>Thanks for choosing Ulu Pandan STARS. This service is provided by Ulu Pandan STARS (&quot;UP STARS&quot;), located at Block 3 Ghim Moh Road, Singapore.
                By signing up as a student, you are agreeing to these terms. <b>Please read them carefully.</b></p>
            <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary 3 / Junior Colleges with primary
                  or lower secondary students who need assistance with academic subjects but lack the funding to secure help. </p>
            <p>2. Students are expected to care about their learning outcomes and behaviour, attend the tuition sessions punctually and regularly. In the event that the student will be absent from tuition, or unable to make it on time,
                  he/she should inform fellow tutors or relevant personnel(s) in advance. The programme organizer reserves the right to request the Student to leave the programme in the event that he/she exhibits inappropriate behaviour(s). </p>
            <p>3. Students are required to achieve a minimum of 80% attendance within the period of tuition.</p>
            <p>4. The programme organizer reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
            <p>5. Users provide their real names and information, and we need your help to keep it that way. Here are some commitments you make to us relating to registering and maintaining the security of your account:</p>
            <p>&emsp; a. You will not provide any false personal information, or create an account for anyone other than yourself without permission.</p>
            <p>&emsp; b. You will not create more than one personal account.</p>
            <p>&emsp; c. If we disable your account, you will not create another one without our permission.</p>
            <p>&emsp; d. To the best of my knowledge, the information contained herein is accurate and reliable as of the date of submission.</p>
            <p>6. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
                  You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.</p>
            <p>7. When accessing or using our Services, you will not:</p>
            <p>&emsp; a. Attempt to gain unauthorized access to another user’s Account or to the Services (or to other computer systems or networks connected to or used together with the Services)</p>
            <p>&emsp; b. Upload, transmit, or distribute to or through the Services any computer viruses, worms, or other software intended to interfere with the intended operation of a computer system or data</p>
            <p>8. PDPA Singapore. Consent to provide Personal Data. By indicating your consent to provide your personal data in this form, you agree to receive updates and important announcements from UP STARS by email and phone. You also agree to
               allow your personal information to be passed to anyone related to UP STARS. All personal information will be kept confidential and used for the purpose(s) required for the operation of UP STARS only.</p>
            <Header>Revisions</Header>
            <p>Last modified: 1st February, 2019</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button negative icon='close' labelPosition='right' content='I DISAGREE' onClick={() => dispatch({ type: 'handleTermsDisagree' })} />
          <Button positive icon='checkmark' labelPosition='right' content='I AGREE' onClick={() => dispatch({ type: 'handleTermsClose' })} />
        </Modal.Actions>
      </Modal>
    </Segment>
  )
}

FamilyDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  state: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  updateFamilyMember: PropTypes.func.isRequired,
  recaptchaRef: PropTypes.object.isRequired
}

export default FamilyDetails
