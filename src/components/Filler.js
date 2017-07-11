import React from 'react'
import { Container, Segment } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const Filler = ({num}) => (

  <Container fluid >
    {[...Array(num)].map((x, i) => (
      <Segment key={i}>Here are some sample texts for you to enjoy</Segment>
  ))}
  </Container>
  )

Filler.propTypes = {
  num: PropTypes.number.isRequired
}

export default Filler
