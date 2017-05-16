import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Main from './components/Main'
import Class from './components/Class'
import './index.css'

const Root = () => (
  <Router>
    <div>
      <Route exact path='/' component={Main} />
      <Route path='/class' component={Class} />
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
