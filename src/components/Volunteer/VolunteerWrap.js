import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'
import axios from 'axios'
import ErrorPage from '../Error/ErrorPage'

class VolunteerWrap extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    _id: PropTypes.string,
    roles: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      filterData: false
    }
  }

  deleteUser = (userId) => {
    axios.delete('/admin/user',
      {
        data: {
          userId
        }
      })
      .catch((err) => console.log(err))
  }

  render () {
    const { match, _id, roles } = this.props
    return (
      <div>
        <Switch>
          <Route exact path={`${match.path}/changepassword`} render={() => <VolunteerChangePassword _id={_id} />} />
          <Route exact path={`${match.path}/profile/:userId`} render={props => <VolunteerEdit roles={roles} {...props} />} />
          <Route exact path={`${match.path}/view`} render={() => <VolunteerView deleteUser={this.deleteUser} roles={roles} />} />
          <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
        </Switch>
      </div>
    )
  }
}

export default VolunteerWrap
