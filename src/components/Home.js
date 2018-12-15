import React from 'react'
import { Message, Grid } from 'semantic-ui-react'

const Home = () => (
  <Grid stackable stretched>
    <Grid.Row>
      <Grid.Column>
        <h2>Welcome to UP Stars HOME page!</h2>
        <Message
          compact
          success
          header='Welcome aboard'
          content='Please update your details under "Profile" ASAP!'
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
)

// Most likely this is a dashboard with all the attendance, class of the user. Since most of the functions in attendance and class are accessible only
// to SuperAdmin.
export default Home
