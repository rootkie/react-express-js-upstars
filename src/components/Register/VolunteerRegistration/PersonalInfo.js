import React from 'react'
import { Form, Button, Modal, Header, Segment } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import PropTypes from 'prop-types'

const genderOptions = [
  { key: 'male', text: 'Male', value: 'M' },
  { key: 'female', text: 'Female', value: 'F' }
]

const nationalityOptions = [
  { key: 'singaporean', text: 'Singaporean', value: 'singaporean' },
  { key: 'korean', text: 'Korean', value: 'korean' },
  { key: 'australian', text: 'Australian', value: 'australian' },
  { key: 'malaysian', text: 'Malaysian', value: 'malaysian' }
]

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

const PersonalInfo = ({ dispatch, state, handleChange, recaptchaRef }) => {
  const { name, address, postalCode, schoolClass, schoolLevel, handphone, homephone, dob, gender, nationality, nric,
    preferredTimeSlot, commencementDate, exitDate, terms, termsDetails } = state

  return (
    <Segment attached='bottom' color='blue'>
      <Form.Group widths='equal'>
        <Form.Input label='Name' placeholder='Name' name='name' value={name} onChange={handleChange} required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Address' placeholder='Address' name='address' value={address} onChange={handleChange} required />
        <Form.Input label='Postal code' placeholder='Postal code' name='postalCode' value={postalCode} onChange={handleChange} type='number' required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='School' placeholder='E.G. UPStars Secondary School' name='schoolLevel' value={schoolLevel} onChange={handleChange} required />
        <Form.Input label='Class level - name' placeholder='E.G. Sec 3-1' name='schoolClass' value={schoolClass} onChange={handleChange} required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Input label='Mobile number' placeholder='Mobile number' name='handphone' value={handphone} onChange={handleChange} type='number' required />
        <Form.Input label='Home tel' placeholder='Home tel' name='homephone' value={homephone} onChange={handleChange} required type='number' />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Field>
          <label>Date of birth</label>
          <DatePicker
            placeholderText='Click to select a date'
            dateFormat='dd/MM/yyyy'
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
            selected={dob}
            maxDate={new Date()}
            onChange={date => dispatch({ type: 'updateField', name: 'dob', value: date })}
            required />
        </Form.Field>
        <Form.Select label='Gender' options={genderOptions} placeholder='Gender' name='gender' value={gender} onChange={handleChange} required />
      </Form.Group>
      <Form.Group widths='equal'>
        <Form.Select label='Nationality' options={nationalityOptions} placeholder='Nationality' name='nationality' value={nationality} onChange={handleChange} required />
        <Form.Input label='NRIC Number' placeholder='NRIC Number' name='nric' value={nric} onChange={handleChange} required />
      </Form.Group>
      <Form.Group inline>
        <label>Date of Preferred Time Slot *</label>
        {timeSlotOptions.map((option, i) => {
          return (
            <Form.Checkbox label={option.text} key={`option-${i}`} name={option.value} onChange={(e, { name, checked }) => dispatch({ type: 'updateTimeslot', name, checked })} checked={preferredTimeSlot[option.value]} />
          )
        })}
      </Form.Group>
      <Form.Field>
        <label>Intended Date of Commencement</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='dd/MM/yyyy'
          selected={commencementDate}
          onChange={date => dispatch({ type: 'updateField', name: 'commencementDate', value: date })}
          required />
      </Form.Field>
      <Form.Field>
        <label>Intended Date of Exit</label>
        <DatePicker
          placeholderText='Click to select a date'
          dateFormat='dd/MM/yyyy'
          selected={exitDate}
          onChange={date => dispatch({ type: 'updateField', name: 'exitDate', value: date })}
          minDate={commencementDate}
          showMonthDropdown
          showYearDropdown
          dropdownMode='select'
          required />
      </Form.Field>

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
            <p>Thanks for choosing Ulu Pandan STARS. This service is provided by Ulu Pandan STARS (&quot;UPSTARS&quot;), located at Block 3 Ghim Moh Road, Singapore.
                By signing up as a volunteer, you are agreeing to these terms. <b>Please read them carefully.</b></p>
            <Header>Volunteer rules</Header>
            <p>1. The UP Stars programme is committed to organizing tuition services of good standards by matching suitably qualified tutors from Secondary Schools or Junior Colleges with primary or lower secondary students who need assistance with academic subjects but lack the funding to secure help. </p>
            <p>2. Tutors are expected to be a role model for the tutees, care about their learning outcomes and behaviour, attend the tuition sessions punctually and regularly. In the event that the tutor will be absent from tuition, he/she should advise the Class Mentor and fellow tutors in advance. The programme organizer reserves the right to request the Tutor to leave the programme in the event that he/she exhibits undesirable behaviour. </p>
            <p>3. A Tutor is expected to serve <b>12 months with minimum attendance of 70%</b> in order to receive a Certificate of Attendance. Any service period of less than 12 months must be approved by the Programme Director prior to the commencement of service. In the exceptional event that tutors have to cease participation in Stars, at least one month’s notice should be given or the organizer reserves the right to deduct service hours from the earned service.
                  A tutor may be requested to leave the programme if he/she attendance rate is irregular and unsatisfactory.</p>
            <p>4. Tutors who made exceptional contributions to the Stars initiative and who have adopted and internalized the Stars selected Harvard competences* can ask for testimonials from the Programme Director. (Note* : google for Harvard competency dictionary for information)</p>
            <p>5. The Stars programme reserves the right to amend the terms and conditions of tuition service including cessation of the program.</p>
            <p>6. Users provide their real names and information, and we need your help to keep it that way. Here are some commitments you make to us relating to registering and maintaining the security of your account:</p>
            <p>&emsp; a. You will not provide any false personal information, or create an account for anyone other than yourself without permission.</p>
            <p>&emsp; b. You will not create more than one personal account.</p>
            <p>&emsp; c. If we disable your account, you will not create another one without our permission.</p>
            <p>&emsp; d. To the best of my knowledge, the information contained herein is accurate and reliable as of the date of submission.</p>
            <p>7. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
                  You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.</p>
            <p>8. When accessing or using our Services, you will not:</p>
            <p>&emsp; a. Attempt to gain unauthorized access to another user’s Account or to the Services (or to other computer systems or networks connected to or used together with the Services)</p>
            <p>&emsp; b. Upload, transmit, or distribute to or through the Services any computer viruses, worms, or other software intended to interfere with the intended operation of a computer system or data</p>
            <p>9. PDPA Singapore. Consent to provide Personal Data. By indicating your consent to provide your personal data in this form, you agree to receive updates and important announcements from UP STARS by email and phone. You also agree to
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

PersonalInfo.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  recaptchaRef: PropTypes.object.isRequired
}

export default PersonalInfo
