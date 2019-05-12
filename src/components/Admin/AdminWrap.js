import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid } from 'semantic-ui-react'
import ChangeStatus from './ChangeStatus'
import ErrorPage from '../Error/ErrorPage'

const AdminWrap = ({ match }) => (
  <React.Fragment>
    <Switch>
      <Route exact path={`${match.path}/status`} render={() => <ChangeStatus />} />
      <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
    </Switch>
    <Grid>
      <Grid.Row></Grid.Row>
    </Grid>
  </React.Fragment>
)

AdminWrap.propTypes = {
  match: PropTypes.object.isRequired
}

export default AdminWrap
