import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Main from './components/Main'
import MainCtrl from './components/MainCtrl'
import Register from './components/Register'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Route exact path='/' component={Main} />
      <Switch>
        <Route path='/register' component={Register} />
        <Route path='/:main/:op?/:sid?' component={MainCtrl} />
      </Switch>
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
