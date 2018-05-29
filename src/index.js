import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Main from './components/Main/Main'
import MainCtrl from './components/MainCtrl'
import StudentRegister from './components/Register/StudentRegisterForm'
import VolunteerRegister from './components/Register/VolunteerRegisterForm'
import Login from './components/Login'
import ForgetPassword from './components/ForgetPassword'
import ResetPassword from './components/ResetPassword'
import 'semantic-ui-css/semantic.min.css'
import './index.css'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Route exact path='/' component={Main} />
      <Switch>
        <Route path='/register/student' component={StudentRegister} />
        <Route path='/register/volunteer' component={VolunteerRegister} />
        <Route path='/login' component={Login} />
        <Route path='/forgetpassword' component={ForgetPassword} />
        <Route path='/resetpassword/:token' component={ResetPassword} />
        <Route path='/:main/:op?/:sid?' component={MainCtrl} />
      </Switch>
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
