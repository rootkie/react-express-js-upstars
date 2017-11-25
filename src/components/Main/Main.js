import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Grid, Container, Image, Divider } from 'semantic-ui-react'
import Navbar from './Navbar'
import Home from './Home'
import Student from './Students'
import Tutor from './Tutors'
import Enrichment from './Enrichment'
import ContactUs from './ContactUs'
import Faq from './FAQ'
import { Redirect } from 'react-router'
import imgHead from './assets/images/head.jpg'

class Main extends Component{
    state = { activePage: 'Home' }

    changePage = (page) => {
        this.setState({ activePage: page })
    }
    render () {
        const { activePage } = this.state
        switch (activePage){
            case 'Login':
                return <Redirect push to='/login' />
            case 'vRegister':
                return <Redirect push to='/register/volunteer' />
            case 'sRegister':
                return <Redirect push to='/register/student' />
        }

        return(
            <Grid>
                <Grid.Column width={2} stretched>
                    <Navbar changePage={this.changePage} />
                </Grid.Column>
                <Grid.Column width={12} stretched style={{paddingBottom:'30px'}}>
                    <Image src={imgHead} fluid style={{marginBottom:'20px' }}/>
                    <Divider hidden />
                        { this.state.activePage === 'Home' && <Home /> }
                        { this.state.activePage === 'Students' && <Student /> }
                        { this.state.activePage === 'Tutors' && <Tutor /> }
                        { this.state.activePage === 'Enrichment' && <Enrichment /> }
                        { this.state.activePage === 'faq' && <Faq />}
                        { this.state.activePage === 'Contact Us' && <ContactUs /> }
                </Grid.Column>
            </Grid>
        )
    }
}

export default Main
