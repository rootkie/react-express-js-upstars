import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import MainCtrl from './components/MainCtrl'
import StudentRegister from './components/Register/StudentRegistration/StudentRegisterForm'
import VolunteerRegister from './components/Register/VolunteerRegistration/VolunteerRegisterForm'
import Login from './components/Login'
import ForgetPassword from './components/Misc/ForgetPassword'
import ResetPassword from './components/Misc/ResetPassword'
import EmailVerify from './components/Misc/EmailVerify'
import Home from './components/Main/Home'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import Student from './components/Main/Students'
import Volunteer from './components/Main/Tutors'
import ErrorPage from './components/Error/ErrorPage'

const Root = () => (
  <Router>
    <div id='page-layout'>
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/student' component={Student} />
        <Route exact path='/volunteer' component={Volunteer} />
        <Route exact path='/register/student' component={StudentRegister} />
        <Route exact path='/register/volunteer' component={VolunteerRegister} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/forgetpassword' component={ForgetPassword} />
        <Route exact path='/resetpassword/:token' component={ResetPassword} />
        <Route exact path='/verifyaccount/:token' component={EmailVerify} />
        <Route path='/dashboard' component={MainCtrl} />
        <Route render={() => <ErrorPage statusCode={'404 NOT FOUND'} errorMessage={'Your request could not be found on the server! That\'s all we know.'} />} />
      </Switch>
    </div>
  </Router>
)

ReactDOM.render(<Root />, document.querySelector('#root'))
