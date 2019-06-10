import React from 'react'
import { Header, Table, Checkbox, Button, Icon, Search, Divider } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import axios from 'axios'

const StudentList = ({ state, roles, dispatch, id, getClass }) => {
  /*
  =============
  FUNCTIONS
  =============
  */
  const handleCheckBoxForStudent = (e, { name: _id, checked }) => {
    const { studentSelected } = state
    const newSelection = checked ? [...studentSelected, _id] : studentSelected.filter(element => element !== _id)
    dispatch({ type: 'handleChange', name: 'studentSelected', value: newSelection })
  }

  const deleteUnsaved = (_id) => e => {
    e.preventDefault()
    const { studentList } = state
    const newList = studentList.filter(el => el._id !== _id)
    dispatch({ type: 'handleChange', name: 'studentList', value: newList })
  }

  const addStudent = async e => {
    e.preventDefault()
    const { studentList } = state
    const idList = studentList.map(info => info._id)
    axios.post('students/class', {
      classId: id,
      studentIds: idList
    })
      .then(response => {
        getClass(id)
        dispatch({ type: 'addStudentSuccess' })
        setTimeout(() => { dispatch({ type: 'closeMessage' }) }, 5000)
      })
      .catch(err => {
        dispatch({ type: 'showError', error: err.response.data.error })
      })
  }

  const deleteStudent = async e => {
    axios.delete('students/class', {
      data: {
        classId: id,
        studentIds: state.studentSelected
      }
    })
      .then(response => {
        getClass(id)
        dispatch({ type: 'deleteStudentSuccess' })
        setTimeout(() => { dispatch({ type: 'closeMessage' }) }, 5000)
      })
      .catch(err => {
        dispatch({ type: 'showError', error: err.response.data.error })
      })
  }

  const handleResultsSelect = (e, { result }) => {
    const { studentList, overallClassData } = state
    const exist = overallClassData.students.findIndex(student => student._id === result._id)
    const duplicate = studentList.findIndex(student => student._id === result._id)
    if (exist !== -1 || duplicate !== -1) {
      return dispatch({ type: 'handleChange', name: 'valueStudent', value: '' })
    }
    const newList = [
      ...studentList,
      {
        _id: result._id,
        name: result.title
      }
    ]
    dispatch({ type: 'handleChange', name: 'studentList', value: newList })
    dispatch({ type: 'handleChange', name: 'valueStudent', value: '' })
  }

  const handleSearchChange = (e, { value }) => {
    if (value.length < 1) {
      return dispatch({ type: 'resetSearch' })
    }
    dispatch({ type: 'searchChangeStudent', value })
    axios.get(`studentsResponsive/${value}`)
      .then(response => {
        const studentOptions = response.data.studentsFiltered.map(student => {
          return {
            title: student.name,
            _id: student._id,
            key: student._id
          }
        })
        dispatch({ type: 'setStudentOption', studentOptions })
      })
  }

  const { overallClassData, studentList, studentSelected, edit, isLoadingStudent, valueStudent, studentOptions } = state
  return (
    <React.Fragment>
      <Header as='h3' dividing>Students</Header>
      {/*
      ==============
      SUPERADMIN
      ==============
       */}
      {(roles.indexOf('SuperAdmin') !== -1 && edit) &&
        <React.Fragment>
          <Table compact celled unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width='1'>Action</Table.HeaderCell>
                <Table.HeaderCell width='12'>Name</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {overallClassData.students.map((Student, i) => (
                <Table.Row key={`student-${i}`}>
                  <Table.Cell collapsing>
                    <Checkbox name={Student._id} onChange={handleCheckBoxForStudent} checked={studentSelected.includes(Student._id)} />
                  </Table.Cell>
                  <Table.Cell>{Student.name}</Table.Cell>
                </Table.Row>))}
              {/* The table below joins but is coloured red so that the user knows they are unsaved changes */}
              {studentList.map((unsavedStudent, i) => (
                <Table.Row key={`unsavedStudent-${i}`} negative>
                  <Table.Cell collapsing>
                    <Button onClick={deleteUnsaved(unsavedStudent._id)}>
                      <Icon name='delete' />
                    </Button>
                  </Table.Cell>
                  <Table.Cell>{unsavedStudent.name}</Table.Cell>
                </Table.Row>))}
            </Table.Body>

            <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan='4'>
                  <Button floated='right' negative icon labelPosition='left' primary size='small' onClick={deleteStudent} disabled={studentSelected.length === 0}>
                    <Icon name='user delete' /> Delete Student(s)
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>

          <Search
            minCharacters={1}
            loading={isLoadingStudent}
            onResultSelect={handleResultsSelect}
            onSearchChange={handleSearchChange}
            results={studentOptions}
            value={valueStudent}
          />
          <Divider hidden />
          <Button positive fluid onClick={addStudent} disabled={studentList.length === 0}>Confirm to add Students to Class</Button>
        </React.Fragment>
      }
      {/*
      ==============
      OTHERS
      ==============
       */}
      {(!edit || roles.indexOf('SuperAdmin') === -1) &&
        <Table compact celled unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width='1'>No.</Table.HeaderCell>
              <Table.HeaderCell width='12'>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          {overallClassData.students.length !== 0 &&
          <Table.Body>
            {overallClassData.students.map((Student, i) => (
              <Table.Row key={`student-${i}`}>
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell>{Student.name}</Table.Cell>
              </Table.Row>))}
          </Table.Body>
          }
          {overallClassData.students.length === 0 &&
          <Table.Body>
            <Table.Row key={`empty-student`}>
              <Table.Cell>1</Table.Cell>
              <Table.Cell>Oops! No Students Found!</Table.Cell>
            </Table.Row>
          </Table.Body>
          }
        </Table>
      }
    </React.Fragment>
  )
}

StudentList.propTypes = {
  state: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  getClass: PropTypes.func.isRequired
}

export default StudentList
