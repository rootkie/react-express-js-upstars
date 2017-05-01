import React from 'react';
import { Router, Route,Switch } from 'react-router';

import App from './components/App';
import About from './components/About';
import NotFound from './components/NotFound';

const Routes = (props) => (
  <Router {...props}>
    <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/about" component={About} />
        <Route exact path="/*" component={NotFound} />
    </Switch>
  </Router>
);

export default Routes;