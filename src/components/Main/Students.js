import React from 'react'
import {List, Table, Divider} from 'semantic-ui-react'

const Student = () => (
    <div>
        <List bulleted horizontal>
            <List.Item as='a' href='#classes'>Classes</List.Item>
            <List.Item as='a' href='#schedule'>Schedule</List.Item>
            <List.Item as='a' href='#fees'>Tuition Fees</List.Item>
        </List>
        <Divider />
            <a name='classes'><h3>Classes:</h3></a>
            <p>
            At UP Stars we offer students from underserved families in Ulu Pandan a conducive learning and growing environment, as well as opportunities for students to better themselves. We are dedicated to serving all children and youths and leaving no one behind.
            </p>
            <p>
            To ensure that students receive close guidance and attention from the tutors, we target to keep the average student to tutor ratio at a maximum of 2. Currently, Mathematics and some English are being taught, with the main focus on Mathematics.
            </p>
            <p>
            The class schedule for 2012 can be found below. All classes are conducted at Block 3, Ulu Pandan Study Centre, Ghim Moh Road.
            </p>
        <Divider />
            <a name='Schedule'><h3>Schedule:</h3></a>
            <Table fixed celled singleline>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Class Level</Table.HeaderCell>
                  <Table.HeaderCell>Day</Table.HeaderCell>
                  <Table.HeaderCell>Time</Table.HeaderCell>
                  <Table.HeaderCell>Venue</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  <Table.Cell>Primary 1/2</Table.Cell>
                  <Table.Cell>Saturday</Table.Cell>
                  <Table.Cell>10 am – 11.30am</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Primary 3</Table.Cell>
                  <Table.Cell>Saturday</Table.Cell>
                  <Table.Cell>2 - 4 pm</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Primary 4</Table.Cell>
                  <Table.Cell>Wednesday</Table.Cell>
                  <Table.Cell>7:30 - 9 pm</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Primary 5</Table.Cell>
                  <Table.Cell>Tuesday</Table.Cell>
                  <Table.Cell>7 - 9 pm</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Primary 6</Table.Cell>
                  <Table.Cell>Thursday</Table.Cell>
                  <Table.Cell>7 - 9 pm</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Secondary</Table.Cell>
                  <Table.Cell>Friday</Table.Cell>
                  <Table.Cell>7 - 9 pm</Table.Cell>
                  <Table.Cell>Ghim Moh Block 3 Study Centre</Table.Cell>
                </Table.Row>

              </Table.Body>
            </Table>
        <Divider />
            <a name='fees'><h3>Tuition Fees:</h3></a>
            <p>There is no fee payable for students who qualify to be in the Stars programme.</p>
    </div>
)

export default Student