import React from 'react'
import PropTypes from 'prop-types'
import { Header, Statistic, Image, Grid } from 'semantic-ui-react'

const ErrorPage = ({statusCode, errorMessage}) => (
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
        <Image size='medium' centered src={require('./../Misc/logo.png')} />
        <Statistic color='red'>
          <Statistic.Value>{statusCode}</Statistic.Value>
          <Statistic.Label>Error</Statistic.Label>
        </Statistic>
        <Header as='h2' color='black' textAlign='center'>
          {errorMessage}
        </Header>
      </Grid.Column>
    </Grid>
  </div>
)

ErrorPage.propTypes = {
  statusCode: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired
}

export default ErrorPage
