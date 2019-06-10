import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Route, Switch } from 'react-router-dom'
import { Dimmer, Loader, Grid } from 'semantic-ui-react'
import AttendanceView from './AttendanceView.js'
import AttendanceClass from './AttendanceClass.js'
import AttendanceUser from './AttendanceUser.js'
import AttendanceStudent from './AttendanceStudent.js'
import AttendanceForm from './AttendanceForm.js'
import AttendanceSearch from './AttendanceSearch.js'
import AttendanceSummary from './AttendanceSummary.js'
import axios from 'axios'
import ErrorPage from '../Error/ErrorPage'

const AttendanceWrap = ({ match, roles }) => {
  const [isLoading, setLoader] = useState(true)
  const [classData, setClassData] = useState([])

  useEffect(() => {
    getClassData()
  }, [])

  const getClassData = async () => {
    const response = await axios.get('/class')
    let classOption = []
    for (const [index, options] of response.data.activeClasses.entries()) {
      classOption[index] = {
        value: options._id,
        text: options.className,
        key: options.className
      }
    }
    setClassData(classOption)
    setLoader(false)
  }

  if (isLoading) {
    return (
      <div>
        <Dimmer active>
          <Loader indeterminate>Loading data</Loader>
        </Dimmer>
      </div>
    )
  }
  return (
  // Add - Form to add attendance
  // Search - Overall search, the most open type
  // View - Form similar to 'add', to edit and view individual attendances
  // user and student - search based on the students' attendance
  // class - search based on classes. Although similar search could be done at the 'search' page, this is an overview, contains overall stats
  // summary - overall summary and stats of all classes - only available to Admin and above
    <React.Fragment>
      <Switch>
        <Route exact path={`${match.path}/add`} render={props => <AttendanceForm classData={classData} {...props} />} />
        <Route exact path={`${match.path}/search`} render={() => <AttendanceSearch classData={classData} />} />
        <Route exact path={`${match.path}/view/:attendanceId`} render={props => <AttendanceView roles={roles} classData={classData} {...props} />} />
        <Route exact path={`${match.path}/user`} render={() => <AttendanceUser classData={classData} />} />
        <Route exact path={`${match.path}/student`} render={() => <AttendanceStudent classData={classData} />} />
        <Route exact path={`${match.path}/class`} render={() => <AttendanceClass classData={classData} />} />
        <Route exact path={`${match.path}/summary`} render={() => <AttendanceSummary />} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
      <Grid>
        <Grid.Row></Grid.Row>
      </Grid>
    </React.Fragment>
  )
}

AttendanceWrap.propTypes = {
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default AttendanceWrap
