import React from 'react'
import { Message } from 'semantic-ui-react'

const Home = () => (
  <div>
    <h2>Welcome to UPStars HOME page!</h2>
    <Message
      compact
      success
      header='Welcome aboard'
      content='Please update your details under "Profile" ASAP!'
    />
  </div>
)

// Most likely this is a dashboard with all the attendance, class of the user. Since most of the functions in attendance and class are accessible only
// to SuperAdmin.
export default Home
