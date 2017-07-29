import React from 'react'
import {Grid, List, Divider} from 'semantic-ui-react'

const Student = () => (
    <div>
        <List bulleted horizontal>
            <List.Item as='a' href='#management'>Tutor Management Programme</List.Item>
            <List.Item as='a' href='#response'>Tutor Responsibilities</List.Item>
            <List.Item as='a' href='#resources'>Resources</List.Item>
        </List>
        <Divider />
            <a name='management'><h3>Tutor Management Programme</h3></a>
            <ol>
              <li>UP Stars aims to  develop in our tutors, core competencies and skill sets that are relevant to  their future roles in society. </li>
              <li>Our tutors are  given autonomy in the classroom to organize and conduct their lessons in the  manner that they find most beneficial for their students. </li>
              <li>Every UP Stars  class is conducted differently based on the tutors discretion and creativity. </li>
              <li>Tutors are  encouraged to attend workshops and gatherings exclusive to UP Stars that are  organized based on their interests and needs. </li>
            </ol>
        <Divider />
            <a name='response'><h3>Tutor Responsibilities:</h3></a>
            <ol>
              <li>UP Stars</li>
              <ol>
                <li>Do remember that  you are committed to this program for one academic year (January to November)</li>
                <li>Do reply to  emails, text messages, phone-calls promptly to acknowledge that you have  received the information, or to confirm attendance for events</li>
                <li>If you are a JC2  student and will like to focus on your studies after the mid year, please find  someone to replace you</li>
                <li>Do spread the  word about UP Stars and encourage your friends to sign up</li>
                <li>Please return the  key to the student centre at the end of the year to UP Stars</li>
                <li>Please join UP  Stars facebook group. </li>
              </ol>
              <li>Students</li>
              <ol>
                <li>Please treat all  students fairly </li>
                <li>Do befriend your  students to find out their interests, hobbies, academic weaknesses, etc</li>
                <li>Be respectful of  your students; some of them are shy and academically weaker. Be supportive and  encouraging!</li>
                <li>Do remember to  call your students a few days before class to encourage them to come</li>
                <li>Do give one week  notice to your students for any class cancellation </li>
                <li>Do start and  attend class on time and end class punctually</li>
                <li>Do refrain from  using treats and sweets as a form of incentive</li>
                <li>You are welcome  to hold extra classes for the students during the holidays or outside tuition  hours at the student centre. Please remember to inform us before the extra  classes</li>
                <li>Classes will not  be held on public holidays</li>
              </ol>
              <li>The Study Centre </li>
              <ol>
                <li>Do be mindful of  the noise levels; the student centre is a facility shared by other users</li>
                <li>Do keep the  student centre clean. Throw all rubbish, especially food containers in the  dustbins outside</li>
                <li>Do remember to  sign in and sign out at the logbook for security reasons</li>
              </ol>

              <li>Fellow Tutors</li>
              <ol>
                <li>Do communicate  with one another regularly to keep each other informed about your attendance</li>
                <li>Do appoint a  group leader who will be responsible for attendance taking </li>
                <li>Do exchange ideas  about how to engage the students </li>
              <li>Do be supportive of one  another</li>
              </ol>
            </ol>
        <Divider />
            <a name='resources'><h3>Resources:</h3></a>
            <ol>
                <li>Please register  at ( <a href="http://test-paper.info/">http://test-paper.info/</a>) </li>
                <li>Do appoint  someone to be in charge of photocopying the worksheets for the students and we  will reimburse you for the photocopying</li>
                <li>Please keep the  answers and solutions for the students</li>
                <li>Feel free to  source for your own material (topical assessment books) and UP Stars will  reimburse you for them</li>
                <li>Please keep all  receipts for reimbursement purposes </li>
            </ol>
    </div>
)

export default Student