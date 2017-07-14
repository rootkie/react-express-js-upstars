import React from 'react'
import { Header, Table, Form, Button, Icon } from 'semantic-ui-react'

const StudentTest = () => (
  <div>
    <Header as='h3' dividing>Student's Academic Information</Header>
    <Form>
      <Table celled striped columns={7} fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              Student's Academic Information
              </Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell>Year</Table.HeaderCell>
            <Table.HeaderCell>Term (1/2/3/4)</Table.HeaderCell>
            <Table.HeaderCell>English (%)</Table.HeaderCell>
            <Table.HeaderCell>Maths (%)</Table.HeaderCell>
            <Table.HeaderCell>Mother tongue (%)</Table.HeaderCell>
            <Table.HeaderCell>Science (%)</Table.HeaderCell>
            <Table.HeaderCell>OVERALL (%)</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
            <Table.Cell>
              <Form.Input transparent placeholder='test' />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='7'>
              <Button floated='right' icon labelPosition='left' primary size='small'>
                <Icon name='user' /> Add Year
            </Button>
              <Button floated='right' icon labelPosition='left' negative size='small'>
                <Icon name='user' /> Remove Year
            </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Form>
  </div>
        )

export default StudentTest
