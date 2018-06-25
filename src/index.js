import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import MainCtrl from './components/MainCtrl'
import StudentRegister from './components/Register/StudentRegisterForm'
import VolunteerRegister from './components/Register/VolunteerRegisterForm'
import Login from './components/Login'
import ForgetPassword from './components/ForgetPassword'
import ResetPassword from './components/ResetPassword'
import EmailVerify from './components/EmailVerify'
import Home from './components/Main/Home'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import Student from './components/Main/Students'
import Volunteer from './components/Main/Tutors'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/student' component={Student} />
        <Route path='/volunteer' component={Volunteer} />
        <Route path='/register/student' component={StudentRegister} />
        <Route path='/register/volunteer' component={VolunteerRegister} />
        <Route path='/login' component={Login} />
        <Route path='/forgetpassword' component={ForgetPassword} />
        <Route path='/resetpassword/:token' component={ResetPassword} />
        <Route path='/verifyaccount/:token' component={EmailVerify} />
        <Route path='/dashboard/:main/:op?/:sid?' component={MainCtrl} />
      </Switch>
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
