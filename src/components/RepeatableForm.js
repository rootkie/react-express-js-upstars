// Doesn't work

import React, { Component } from 'react'
import { Form, Button } from 'semantic-ui-react'

class RepeatableForm extends Component {
  state = {
    repeatedItems: [...this.props.children, ...this.props.children]
  }

  handleClick = (change) => {
    const { repeatedItems } = this.state
    if (change === 'inc') {
      repeatedItems.push([...this.props.children])
    } else if (change === 'dec') {
      repeatedItems.splice(-1, 1)
    }
    this.setState(repeatedItems)
  }

  render () {
    const { repeatedItems } = this.state
    return (
      <div>
        {repeatedItems.map((itemGroup, i) => (
          <div key={i}>
            {itemGroup.map((item) => (React.cloneElement(item, {id: item.props.id + '-'})))}
          </div>
      ))}
        <Button.Group>
          <Button positive onClick={this.handleClick('inc')}>Add</Button>
          <Button.Or />
          <Button negative onClick={this.handleClick('dec')}>Remove</Button>
        </Button.Group>
      </div>
    )
  }
}

export default RepeatableForm
