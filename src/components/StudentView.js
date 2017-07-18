import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Table, Checkbox, Button, Icon, Form, Dropdown, Confirm } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'

let sampleStudentData = [
  {name: 'xiaoMing', age: 12, attendanceRate: '60%', dank: 'yes'},
  {name: 'xiaoXing', age: 24, attendanceRate: '40%', dank: 'yes'},
  {name: 'Michael', age: 6, attendanceRate: '90%', dank: 'no'}
]

const classOptions = [
  { key: 'python420', text: 'Python 420pm', value: 'py420' },
  { key: 'css', text: 'CSS', value: 'css' },
  { key: 'englishP5', text: 'English Primary 5', value: 'elp5' }
]

const volunteerOptions = [
  { key: 'a', text: 'Won YK', value: 'wonyk' },
  { key: 'b', text: 'John Doe', value: 'jd' },
  { key: 'c', text: 'Ciri', value: 'ciri' }
]

const studentOptions = [
  { key: 'ahboy', text: 'Ah Boy', value: 'ahboy' },
  { key: 'xiaoming', text: 'Xiao Ming', value: 'xiaoming' },
  { key: 'borhk', text: 'Borhk', value: 'borhk' }
]
class StudentView extends Component {
  state = {
    selected: [],
    studentData: sampleStudentData,
    deleteConfirmationVisibility: false,

    searchName: '',
    moreOptions: false,
    classSelector: [],
    volunteerSelector: [],
    studentSelector: []
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { searchName } = this.state
    console.log(`Searching for ${searchName}`)
  }

  handleCheckboxChange = (e, { name, checked }) => {
    let { selected } = this.state
    if (checked) {
      selected.push(name)
    } else {
      selected = selected.filter((element) => element !== name)
    }
    this.setState({selected})
  }

  handleChange = (e, { name, value }) => this.setState({[name]: value})

  toggleOptions = () => this.setState({moreOptions: !this.state.moreOptions})

  removeStudents = (studentsToRemove) => {
    console.log(`removing ${studentsToRemove.join('')}`)
    let { studentData, selected } = this.state
    studentData = studentData.reduce((curr, next) => (
      studentsToRemove.includes(next.name) ? curr : curr.concat(next)
    ), [])

    selected = selected.filter((student) => (!studentsToRemove.includes(student)))

    this.setState({studentData, selected})
  }

  handleDelete = () => {
    const { selected } = this.state
    this.removeStudents(selected)
  }

  handleDeleteConfirmation = (option) => () => {
    switch (option) {
      case 'show':
        this.setState({deleteConfirmationVisibility: true})
        break
      case 'confirm':
        this.handleDelete()
        // break omitted

      case 'cancel': // eslint-disable-line
        this.setState({deleteConfirmationVisibility: false})
        break

      default:
    }
  }

  render () {
    const { selected, searchName, studentData, deleteConfirmationVisibility, moreOptions, classSelector, volunteerSelector, studentSelector } = this.state
    return (
      <Table compact celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>
              <Form onSubmit={this.handleSubmit}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Form.Group inline style={{marginBottom: 0}}>
                    <Form.Input label='Search by name' placeholder='Student Name' name='searchName' value={searchName} onChange={this.handleChange} />
                    <Form.Button>Go</Form.Button>
                  </Form.Group>
                  <Icon style={{cursor: 'pointer'}} name={`chevron ${moreOptions ? 'up' : 'down'}`} onClick={this.toggleOptions} />
                </div>
                {moreOptions && <div>
                  <Form.Field style={{paddingTop: '10px'}}>
                    <label>Filter by Classes</label>
                    <Dropdown name='classSelector' value={classSelector} placeholder='Pick Classes' search multiple selection options={classOptions} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>Filter by Volunteers</label>
                    <Dropdown name='volunteerSelector' value={volunteerSelector} placeholder='Pick Volunteers' search multiple selection options={volunteerOptions} onChange={this.handleChange} />
                  </Form.Field>
                  <Form.Field>
                    <label>Filter by Students</label>
                    <Dropdown name='studentSelector' value={studentSelector} placeholder='Pick Students' search multiple selection options={studentOptions} onChange={this.handleChange} />
                  </Form.Field>
                </div>}

              </Form>
            </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Age</Table.HeaderCell>
            <Table.HeaderCell>Attendance Rate</Table.HeaderCell>
            <Table.HeaderCell>Dank</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {studentData.map((student, i) => (
            <Table.Row key={`student-${i}`}>
              <Table.Cell collapsing>
                <Checkbox name={student.name} onChange={this.handleCheckboxChange} checked={selected.includes(student.name)} />
              </Table.Cell>
              <Table.Cell>{student.name}</Table.Cell>
              <Table.Cell>{student.age}</Table.Cell>
              <Table.Cell>{student.attendanceRate}</Table.Cell>
              <Table.Cell>{student.dank}</Table.Cell>
            </Table.Row>))}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell colSpan='4'>
              <Link to='/students/add'>
                <Button as='div' floated='right' icon labelPosition='left' primary size='small'>
                  <Icon name='user' />New Student
              </Button>
              </Link>
              <Button size='small' disabled={selected.length === 0} negative onClick={this.handleDeleteConfirmation('show')}>Delete</Button>
              <Confirm
                open={deleteConfirmationVisibility}
                header='Deleting the following students:'
                content={selected.join(', ')}
                onCancel={this.handleDeleteConfirmation('cancel')}
                onConfirm={this.handleDeleteConfirmation('confirm')}
        />

            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    )
  }
}

export default StudentView
