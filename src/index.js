import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Main from './components/Main'
import MainCtrl from './components/MainCtrl'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Route exact path='/' component={Main} />
      <Route path='/:main/:op' component={MainCtrl} />
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
