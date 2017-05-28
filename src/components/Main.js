import React, { Component } from 'react'
import { Container, Sidebar, Segment, Menu, Icon, Header } from 'semantic-ui-react'

const sidebarStyle = {
  'height': '100%',
  'maxHeight': '100%'
}

const headerStyle = {
  'height': '74px',
  'display': 'flex',
  'width': '100%',
  'backgroundColor': 'white',
  'position': 'fixed',
  'top': '0px'
}

class Main extends Component {
  state = { visible: true }
  render () {
    const { visible } = this.state
    return (
      <div id='sidebar-layout'>
        <Sidebar.Pushable as={Segment} basic >
          <Sidebar as={Menu} animation='slide along' visible={visible} width='thin' icon='labeled' vertical fixed={'left'} style={sidebarStyle}>
            <Menu.Item name='home'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item name='camera'>
              <Icon name='camera' />
              Camera
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher>
            <Header size='huge' dividing style={headerStyle}>
              <div className='nav'>
                <span id='logo'>UPStars</span>
              </div>
            </Header>
            <Container className='main-container'>
              <Segment>
                Test contents
              </Segment>
              <Segment raised>
                Shake treat bag ears back wide eyed demand to be let outside at once, and expect owner to wait for me as i think about it. Licks your face favor packaging over toy. I could pee on this if i had the energy. Curl up and sleep on the freshly laundered towels eat a plant, kill a hand or cereal boxes make for five star accommodation kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff but pose purrfectly to show my beauty but i could pee on this if i had the energy for cat slap dog in face. Sit in window and stare oooh, a bird, yum meoooow. Play time touch water with paw then recoil in horror and claw drapes chase the pig around the house favor packaging over toy. Stare out the window walk on car leaving trail of paw prints on hood and windshield vommit food and eat it again put toy mouse in food bowl run out of litter box at full speed for find something else more interesting, or eat owner's food yet destroy couch. Cat not kitten around . Gnaw the corn cob. Eat prawns daintily with a claw then lick paws clean wash down prawns with a lap of carnation milk then retire to the warmest spot on the couch to claw at the fabric before taking a catnap hide at bottom of staircase to trip human but poop in the plant pot bathe private parts with tongue then lick owner's face yet proudly present butt to human so scamper sniff other cat's butt and hang jaw half open thereafter. Meow all night having their mate disturbing sleeping humans lick butt, and sometimes switches in french and say "miaou" just because well why not cats go for world domination but slap owner's face at 5am until human fills food dish for eat a
              </Segment>
              <Segment raised>
                Shake treat bag ears back wide eyed demand to be let outside at once, and expect owner to wait for me as i think about it. Licks your face favor packaging over toy. I could pee on this if i had the energy. Curl up and sleep on the freshly laundered towels eat a plant, kill a hand or cereal boxes make for five star accommodation kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff but pose purrfectly to show my beauty but i could pee on this if i had the energy for cat slap dog in face. Sit in window and stare oooh, a bird, yum meoooow. Play time touch water with paw then recoil in horror and claw drapes chase the pig around the house favor packaging over toy. Stare out the window walk on car leaving trail of paw prints on hood and windshield vommit food and eat it again put toy mouse in food bowl run out of litter box at full speed for find something else more interesting, or eat owner's food yet destroy couch. Cat not kitten around . Gnaw the corn cob. Eat prawns daintily with a claw then lick paws clean wash down prawns with a lap of carnation milk then retire to the warmest spot on the couch to claw at the fabric before taking a catnap hide at bottom of staircase to trip human but poop in the plant pot bathe private parts with tongue then lick owner's face yet proudly present butt to human so scamper sniff other cat's butt and hang jaw half open thereafter. Meow all night having their mate disturbing sleeping humans lick butt, and sometimes switches in french and say "miaou" just because well why not cats go for world domination but slap owner's face at 5am until human fills food dish for eat a
              </Segment>
              <Segment raised>
                Shake treat bag ears back wide eyed demand to be let outside at once, and expect owner to wait for me as i think about it. Licks your face favor packaging over toy. I could pee on this if i had the energy. Curl up and sleep on the freshly laundered towels eat a plant, kill a hand or cereal boxes make for five star accommodation kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff but pose purrfectly to show my beauty but i could pee on this if i had the energy for cat slap dog in face. Sit in window and stare oooh, a bird, yum meoooow. Play time touch water with paw then recoil in horror and claw drapes chase the pig around the house favor packaging over toy. Stare out the window walk on car leaving trail of paw prints on hood and windshield vommit food and eat it again put toy mouse in food bowl run out of litter box at full speed for find something else more interesting, or eat owner's food yet destroy couch. Cat not kitten around . Gnaw the corn cob. Eat prawns daintily with a claw then lick paws clean wash down prawns with a lap of carnation milk then retire to the warmest spot on the couch to claw at the fabric before taking a catnap hide at bottom of staircase to trip human but poop in the plant pot bathe private parts with tongue then lick owner's face yet proudly present butt to human so scamper sniff other cat's butt and hang jaw half open thereafter. Meow all night having their mate disturbing sleeping humans lick butt, and sometimes switches in french and say "miaou" just because well why not cats go for world domination but slap owner's face at 5am until human fills food dish for eat a
              </Segment>
            </Container>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    )
  }
}
export default Main
