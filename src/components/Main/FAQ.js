import React from 'react'
import { Divider } from 'semantic-ui-react'

const Faq = () => (
    <div>
        <h2>General Questions</h2>
        <Divider />
        <ol>
            <li><h4>Who does UP Stars provide tuition services to?</h4></li>
            <p>UP Stars provides tuition to children from families living in the Ulu Pandan area. We aim in particular to reach out to underserved families in Ulu Pandan.</p>
        </ol>
        <Divider />
        <h2>Tutor Questions</h2>
        <Divider />
        <ol>
            <li><h4>How do I sign up for the volunteer services?</h4></li>
            <p>Go to the Homepage of www.ulupandanstar.org, click on “Sign Up”, then click on “Sign Up for Volunteers”. Complete the online e-form and click on “Submit”. We will confirm your registration within 24 hours.</p>
            <li><h4>I need to submit details about UP Stars to my school for community service records. What should I put down?</h4></li>
            <ul>
                <li>Title of Program: UP Stars</li>
                <li>Venue: Block 3 Ghim Moh Road</li>
                <li>Organization: Ulu Pandan PAP Foundation Centre (PCF) and Citizen Consultative Committee (CCC).</li>
            </ul>
            <li><h4>Will I be able to get a letter of recognition?</h4></li>
            <p>Yes all our tutors will get a letter of certificate that stipulates the number of hours committed to UP Stars. For tutors who make outstanding contributions, there will be strong testimonials in acknowledgement.</p>
            <li><h4>I stay in a hostel and I have a curfew. Will UP Star provide me with a letter of excuse?</h4></li>
            <p>Yes. Please give us the exact details as to whom we should address the letter to and the name of your hostel.</p>
        </ol>
    </div>
)

export default Faq