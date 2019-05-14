import React from 'react'
import { Form, Segment, Table, Header, Icon, Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const PersonalStatement = ({state, handleChange, dispatch}) => {
  /*
  ==================
  FUNCTIONS
  ==================
  */
  const handleRepeatable = (option, field) => (e) => {
    e.preventDefault()
    if (state.edit === true) {
      let updatingField
      if (option === 'inc') {
        switch (field) {
          case 'formalEducation':
            updatingField = [
              ...state[field],
              {
                dateFrom: moment(),
                dateTo: moment(),
                school: '',
                highestLevel: ''
              }
            ]
            break
          case 'coursesSeminar':
            updatingField = [
              ...state[field],
              {
                year: '',
                courseAndObjective: ''
              }
            ]
            break
          case 'achievements':
            updatingField = [
              ...state[field],
              {
                dateFrom: moment(),
                dateTo: moment(),
                organisation: '',
                description: ''
              }
            ]
            break
          case 'cca':
          case 'cip':
          case 'workInternExp':
            updatingField = [
              ...state[field],
              {
                dateFrom: moment(),
                dateTo: moment(),
                organisation: '',
                rolePosition: ''
              }
            ]
            break
          case 'competence':
            updatingField = [
              ...state[field],
              {
                language: '',
                subjects: '',
                interests: ''
              }
            ]
            break
          default:
            break
        }
      } else if (option === 'dec') {
        updatingField = state[field].slice(0, -1)
      }
      dispatch({type: 'updateField', name: field, value: updatingField})
    }
  }

  const updateRepeatableChange = (index, field, property) => (e, {value}) => {
    if (state.edit === true) {
      const updatingField = [
        ...state[field]
      ]
      updatingField[index][property] = value
      dispatch({type: 'updateField', name: field, value: updatingField})
    }
  }

  const updateRepeatableDateChange = (field, dateType, i) => (date) => {
    if (state.edit === true) {
      const updatingField = [...state[field]]
      updatingField[i][dateType] = date
      dispatch({type: 'updateField', name: field, value: updatingField})
    }
  }

  /*
  ===========
  RENDER
  ===========
  */

  const { formalEducation, coursesSeminar, achievements, cca, cip, workInternExp, languages, subjects, interests } = state
  return (
    <Segment attached='bottom' color='orange'>
      <Header as='h3' dividing>Formal Education</Header>
      <Table celled striped columns={4} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Starting Date</Table.HeaderCell>
            <Table.HeaderCell>Ending Date</Table.HeaderCell>
            <Table.HeaderCell>Name of Institution / School</Table.HeaderCell>
            <Table.HeaderCell>Highest Level / Course</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {formalEducation.map((education, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={education.dateFrom ? moment(education.dateFrom) : undefined}
                    selectsStart
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    maxDate={education.dateTo ? moment(education.dateTo) : undefined}
                    onChange={updateRepeatableDateChange('formalEducation', 'dateFrom', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={education.dateTo ? moment(education.dateTo) : undefined}
                    selectsEnd
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    minDate={education.dateFrom ? moment(education.dateFrom) : undefined}
                    onChange={updateRepeatableDateChange('formalEducation', 'dateTo', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`school-${i}`} name={`school-${i}`} value={education.school} placeholder='Name of Institution' onChange={updateRepeatableChange(i, 'formalEducation', 'school')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`highestLevel-${i}`} name={`highestLevel-${i}`} value={education.highestLevel} placeholder='Highest Level' onChange={updateRepeatableChange(i, 'formalEducation', 'highestLevel')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'formalEducation')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'formalEducation')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Courses and Seminars</Header>
      <Table celled striped columns={2} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={3}>Year</Table.HeaderCell>
            <Table.HeaderCell width={7}>Course title and Learning Objectives</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {coursesSeminar.map((courseDetail, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Input transparent key={`year-${i}`} name={`year-${i}`} value={courseDetail.year} placeholder='Year' onChange={updateRepeatableChange(i, 'coursesSeminar', 'year')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`courseTitle-${i}`} name={`courseTitle-${i}`} value={courseDetail.courseAndObjective} placeholder='Name of Institution' onChange={updateRepeatableChange(i, 'coursesSeminar', 'courseAndObjective')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='2'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'coursesSeminar')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'coursesSeminar')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Achievements</Header>
      <Table celled striped columns={4} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Starting Date</Table.HeaderCell>
            <Table.HeaderCell>Ending Date</Table.HeaderCell>
            <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
            <Table.HeaderCell>Description of Award</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {achievements.map((achievement, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={achievement.dateFrom ? moment(achievement.dateFrom) : undefined}
                    maxDate={achievement.dateTo ? moment(achievement.dateTo) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('achievements', 'dateFrom', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={achievement.dateTo ? moment(achievement.dateTo) : undefined}
                    minDate={achievement.dateFrom ? moment(achievement.dateFrom) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('achievements', 'dateTo', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={achievement.organisation} placeholder='Name of Organisation' onChange={updateRepeatableChange(i, 'achievements', 'organisation')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`description-${i}`} name={`description-${i}`} value={achievement.description} placeholder='Description of Award' onChange={updateRepeatableChange(i, 'achievements', 'description')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'achievements')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'achievements')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Co-Curricular Activities</Header>
      <Table celled striped columns={4} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Starting Date</Table.HeaderCell>
            <Table.HeaderCell>Ending Date</Table.HeaderCell>
            <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
            <Table.HeaderCell>Position / Role</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cca.map((activity, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={activity.dateFrom ? moment(activity.dateFrom) : undefined}
                    maxDate={activity.dateTo ? moment(activity.dateTo) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('cca', 'dateFrom', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={activity.dateTo ? moment(activity.dateTo) : undefined}
                    minDate={activity.dateFrom ? moment(activity.dateFrom) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('cca', 'dateTo', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={activity.organisation} placeholder='Name of Organisation' onChange={updateRepeatableChange(i, 'cca', 'organisation')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={activity.rolePosition} placeholder='rolePosition' onChange={updateRepeatableChange(i, 'cca', 'rolePosition')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'cca')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'cca')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Community Servies</Header>
      <Table celled striped columns={4} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Starting Date</Table.HeaderCell>
            <Table.HeaderCell>Ending Date</Table.HeaderCell>
            <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
            <Table.HeaderCell>Position / Role</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cip.map((service, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={service.dateFrom ? moment(service.dateFrom) : undefined}
                    maxDate={service.dateTo ? moment(service.dateTo) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('cip', 'dateFrom', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={service.dateTo ? moment(service.dateTo) : undefined}
                    minDate={service.dateFrom ? moment(service.dateFrom) : undefined}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    onChange={updateRepeatableDateChange('cip', 'dateTo', i)}
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={service.organisation} placeholder='Name of Organisation' onChange={updateRepeatableChange(i, 'cip', 'organisation')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={service.rolePosition} placeholder='rolePosition' onChange={updateRepeatableChange(i, 'cip', 'rolePosition')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'cip')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'cip')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Name of Employer / Organisation</Header>
      <Table celled striped columns={4} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Starting Date</Table.HeaderCell>
            <Table.HeaderCell>Ending Date</Table.HeaderCell>
            <Table.HeaderCell>Name of Organisation</Table.HeaderCell>
            <Table.HeaderCell>Position / Role</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {workInternExp.map((work, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={work.dateFrom ? moment(work.dateFrom) : undefined}
                    maxDate={work.dateTo ? moment(work.dateTo) : undefined}
                    onChange={updateRepeatableDateChange('workInternExp', 'dateFrom', i)}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Field>
                  <DatePicker
                    selected={work.dateTo ? moment(work.dateTo) : undefined}
                    minDate={work.dateFrom ? moment(work.dateFrom) : undefined}
                    onChange={updateRepeatableDateChange('workInternExp', 'dateTo', i)}
                    dateFormat='DD/MM/YYYY'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    placeholderText='Click to select' />
                </Form.Field>
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`organisation-${i}`} name={`organisation-${i}`} value={work.organisation} placeholder='Name of Organisation' onChange={updateRepeatableChange(i, 'workInternExp', 'organisation')} />
              </Table.Cell>
              <Table.Cell>
                <Form.Input transparent key={`rolePosition-${i}`} name={`rolePosition-${i}`} value={work.rolePosition} placeholder='rolePosition' onChange={updateRepeatableChange(i, 'workInternExp', 'rolePosition')} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              <Button floated='right' icon labelPosition='left' primary size='small' onClick={handleRepeatable('inc', 'workInternExp')}>
                <Icon name='plus' /> Add Year
              </Button>
              <Button floated='right' icon labelPosition='left' negative size='small' onClick={handleRepeatable('dec', 'workInternExp')}>
                <Icon name='minus' /> Remove Year
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <Header as='h3' dividing>Competences Relevant For Teaching Children</Header>
      <Table celled striped columns={3} unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={4}>Languages</Table.HeaderCell>
            <Table.HeaderCell width={4}>Subjects</Table.HeaderCell>
            <Table.HeaderCell width={4}>Interests</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell style={{ overflow: 'visible' }}>
              <Form.Input transparent key={`languages`} placeholder='Specific language' name='languages' value={languages} onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent key={`subjects`} name='subjects' value={subjects} placeholder='Specific subjects' onChange={handleChange} />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent key={`interests`} name='interests' value={interests} placeholder='Specific interests' onChange={handleChange} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Segment>
  )
}

PersonalStatement.propTypes = {
  state: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default PersonalStatement
