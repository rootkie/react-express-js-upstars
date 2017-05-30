import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Main from './components/Main'
import Classes from './components/Classes'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Route exact path='/' component={Main} />
      <Route path='/classes/:op' component={Classes} />
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
