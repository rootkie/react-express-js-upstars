import React, { Component } from 'react'
import { Header, Statistic, Image, Grid } from 'semantic-ui-react'

class FourZeroFour extends Component {
  render () {
    return (
      <div className='verify-form'>
        <style>{`
          body > div,
          body > div > div,
          body > div > div > div.verify-form {
            height: 100%;
          }
    `}</style>
        <Grid
          textAlign='center'
          style={{ height: '100%' }}
          verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 550 }}>
            <Image size='medium' centered src={require('./../logo.png')} />
            <Statistic color='red'>
              <Statistic.Value>404 NOT FOUND</Statistic.Value>
              <Statistic.Label>Error</Statistic.Label>
            </Statistic>
            <Header as='h2' color='black' textAlign='center'>
              Your request could not be found on the server! That's all we know.
            </Header>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default FourZeroFour
