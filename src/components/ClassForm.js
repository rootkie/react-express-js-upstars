import React, { Component } from 'react'
import { Form, Message } from 'semantic-ui-react'
import DatePicker from 'react-datepicker'
import { object, bool, func } from 'prop-types'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment'

const typeOptions = [
  { key: 'tuition', text: 'Tuition', value: 'Tuition' },
  { key: 'enrichment', text: 'Enrichment', value: 'Enrichment' }
]

const initialState = {
  className: '',
  classType: '',
  venue: '',
  dayAndTime: '',
  startDate: '',
  serverErrorMessage: ''
}

class ClassForm extends Component {
  static propTypes = {
    classData: object,
    edit: bool,
    editClass: func,
    addClass: func
  }

  filterPropData = (checkArray) => { // consider moving this up to the wrapper
    const { classData } = this.props
    return Object.keys(classData).reduce((last, curr) => (checkArray.includes(curr) ? {...last, [curr]: classData[curr]} : last
  ), {})
  }

  state = this.props.classData
  ? {
    ...this.filterPropData(['className', 'classType', 'dayAndTime', 'venue']),
    startDate: moment(this.props.classData.startDate),
    error: [],
    submitSuccess: false,
    serverErrorMessage: ''
  }
  : {...initialState, submitSuccess: false}

  checkRequired = (checkArray) => {
    const error = []
    for (let i of checkArray) {
      const item = this.state[i]
      if (!item || item === '') error.push(i)
    }
    return error
  }

  handleChange = (e, { name, value, checked }) => this.setState({ [name]: value || checked })

  handleDateChange = (startDate) => this.setState({startDate})

  handleSubmit = async e => {
    e.preventDefault()
    const { className, classType, venue, dayAndTime, startDate } = this.state
    const { edit, editClass, addClass } = this.props
    // check required fields
    let requiredFields = (classType === 'Tuition') ? ['className', 'classType', 'venue', 'dayAndTime', 'startDate'] : ['className', 'classType', 'venue', 'startDate']
    const error = this.checkRequired(requiredFields)

    if (error.length === 0) {
      const data = {
        className,
        classType,
        venue,
        dayAndTime,
        startDate
      }

      if (edit) {
        try {
          await editClass(data)
          this.showSuccess()
        } catch (error) {
          this.setState({serverErrorMessage: error.response.data.error})
          console.log(error)
        }
      } else { // not in edit mode
        try {
          await addClass(data)
          this.showSuccess()
          this.setState({...initialState})
        } catch (error) {
          this.setState({serverErrorMessage: error.response.data.error})
        }
      }
    } else {
      console.log('Incomplete Fields')
      this.setState({error, serverErrorMessage: 'Please check all required fields are filled in correctly'})
    }
  }

  showSuccess = () => {
    this.setState({submitSuccess: true})
    setTimeout(() => { this.setState({submitSuccess: false}) }, 5000)
  }

  render () {
    const { className, classType, venue, dayAndTime, serverErrorMessage, submitSuccess } = this.state // submitted version are used to display the info sent through POST (not necessary)

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input label='Name of Class' placeholder='Name of the class' name='className' value={className} onChange={this.handleChange} required />
          <Form.Select label='Type' options={typeOptions} placeholder='Tuition' name='classType' value={classType} onChange={this.handleChange} required />
          <Form.Input label='Venue' placeholder='Venue of the class' name='venue' value={venue} onChange={this.handleChange} required />
          <Form.Field required>
            <label>Starting Date</label>
            <DatePicker
              placeholderText='Click to select a date'
              dateFormat='DD/MM/YYYY'
              selected={this.state.startDate}
              onChange={this.handleDateChange} required />
          </Form.Field>
          <Form.Input label='Day and Time' placeholder='Day time' name='dayAndTime' value={dayAndTime} onChange={this.handleChange} disabled={classType === 'Enrichment'} required={classType === 'Tuition'} />
          {serverErrorMessage.length > 0 && <Message negative>{serverErrorMessage}</Message> }
          {submitSuccess && <Message positive>Class created</Message> }
          <Form.Button>Submit</Form.Button>
        </Form>

      </div>
    )
  }
}

export default ClassForm
