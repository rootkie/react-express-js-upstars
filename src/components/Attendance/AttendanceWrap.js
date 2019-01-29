import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, Switch } from 'react-router-dom'
import { Dimmer, Loader } from 'semantic-ui-react'
import AttendanceView from './AttendanceView.js'
import AttendanceClass from './AttendanceClass.js'
import AttendanceUser from './AttendanceUser.js'
import AttendanceStudent from './AttendanceStudent.js'
import AttendanceForm from './AttendanceForm.js'
import AttendanceSearch from './AttendanceSearch.js'
import AttendanceSummary from './AttendanceSummary.js'
import axios from 'axios'
import ErrorPage from '../Error/ErrorPage'

class AttendanceWrap extends Component {
  // get data from server. Declare the states.
  constructor (props) {
    super(props)
    this.state = {
      classData: [],
      token: window.localStorage.token,
      isLoading: true
    }
    // Temp Solution. Would prefer to only GET classes the user belongs in.
    axios.get('/class')
      .then((response) => {
        let classOption = []
        for (let [index, options] of response.data.activeClasses.entries()) {
          classOption[index] = {
            value: options._id,
            text: options.className,
            key: options.className
          }
        }
        this.setState({ classData: classOption, isLoading: false })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  render () {
    const { isLoading } = this.state
    const { match, roles } = this.props
    if (isLoading) {
      return (
        <div>
          <Dimmer active>
            <Loader indeterminate>Loading data</Loader>
          </Dimmer>
        </div>
      )
    } else {
      return (
        // Add - Form to add attendance
        // Search - Overall search, the most open type
        // View - Form similar to 'add', to edit and view individual attendances
        // user and student - search based on the students' attendance
        // class - search based on classes. Although similar search could be done at the 'search' page, this is an overview, contains overall stats
        // summary - overall summary and stats of all classes - only available to Admin and above
        <div>
          <Switch>
            <Route exact path={`${match.path}/add`} render={() => <AttendanceForm classData={this.state.classData} />} />
            <Route exact path={`${match.path}/search`} render={() => <AttendanceSearch classData={this.state.classData} />} />
            <Route exact path={`${match.path}/view/:attendanceId`} render={props => <AttendanceView roles={roles} classData={this.state.classData} {...props} />} />
            <Route exact path={`${match.path}/user`} render={() => <AttendanceUser classData={this.state.classData} />} />
            <Route exact path={`${match.path}/student`} render={() => <AttendanceStudent classData={this.state.classData} />} />
            <Route exact path={`${match.path}/class`} render={() => <AttendanceClass classData={this.state.classData} />} />
            <Route exact path={`${match.path}/summary`} render={() => <AttendanceSummary />} />
            <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
          </Switch>
        </div>
      )
    }
  }
}

AttendanceWrap.propTypes = {
  match: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired
}

export default AttendanceWrap
