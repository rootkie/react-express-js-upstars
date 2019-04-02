import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import VolunteerView from './VolunteerView'
import VolunteerEdit from './VolunteerEdit'
import VolunteerChangePassword from './VolunteerChangePassword'
import ErrorPage from '../Error/ErrorPage'

const VolunteerWrap = ({match, _id, roles}) => {
  // const deleteUser = (userId) => {
  //   axios.delete('/admin/user',
  //     {
  //       data: {
  //         userId
  //       }
  //     })
  //     .catch((err) => console.log(err))
  // }
  return (
    <div>
      <Switch>
        <Route exact path={`${match.path}/changepassword`} render={() => <VolunteerChangePassword _id={_id} />} />
        <Route exact path={`${match.path}/profile/:userId`} render={props => <VolunteerEdit roles={roles} {...props} />} />
        <Route exact path={`${match.path}/view`} render={() => <VolunteerView roles={roles} />} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
    </div>
  )
}

VolunteerWrap.propTypes = {
  match: PropTypes.object.isRequired,
  _id: PropTypes.string,
  roles: PropTypes.array.isRequired
}

export default VolunteerWrap
