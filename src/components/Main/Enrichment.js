import React from 'react'
import {Grid, List, Image, Divider} from 'semantic-ui-react'
import img1 from './assets/images/enrichment1.jpg'
import img2 from './assets/images/enrichment2.jpg'
const Enrichment = () => (
    <div>
        <List bulleted horizontal>
            <List.Item as='a' href='#tortoise'>The Rabbit and the Tortoise </List.Item>
            <List.Item as='a' href='#enrich'>New UP Stars Enrichment Program Launched</List.Item>
        </List>
        <Divider />
            <a name='tortoise'><h3>The Rabbit and the Tortoise:</h3></a>
            <Image src={img1} size='medium' floated='right' />
            <p>On 7th Nov 2009 the Rabbit and the Tortoise came to live.</p>
            <p>
              11 children between P3 and P6 asked themselves "Is there something I am good at and can spend hours on tirelessly? Parents and friends compliment me for the way I sing or dance or play football or basketball? I have talent and will use it to set my goals for my future career" 
            </p>
            
            <p>The workshop was filled with activities, to cultivate confidence when speaking in front of people, acting and decision making through story telling, whilst interacting as a team with people in the group.</p>
            <p>Participants are keen to join the next enrichment class to see how the rabbit won the race.</p>
        <Divider />
            <a name='enrich'><h3>New UP Stars Enrichment Program Launched</h3></a>
            <Image src={img2} size='medium' floated='right' />
            <p>
              22 children from the Ulu Pandan neighbourhood excitedly gathered on the 4th June 2009 afternoon, at UP Study Centre to participate in the inaugural UP Stars Enrichment program.
            </p>
            <p>
              Themed “Fox and Hounds”, the children learnt lifeskills on defending themselves from being bullied and also to correct themselves when they occasionally are the bully.             
            </p>
            <p>
              The enrichment program hopes to instill values, to positively affect children’s lives.
            </p>
    </div>
)

export default Enrichment