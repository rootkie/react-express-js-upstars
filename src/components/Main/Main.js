import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Grid, Container, Image, Divider } from 'semantic-ui-react'
import Navbar from './Navbar'
import Home from './Home'
import { Redirect } from 'react-router'
import imgHead from './assets/images/head.jpg'

class Main extends Component{
    state = { activePage: 'Home' }

    changePage = (page) => {
        this.setState({ activePage: page })
    }
    render () {
        const { activePage } = this.state
        console.log(activePage)
        switch (activePage){
            case 'Login':
                return <Redirect to='/login' />
            case 'vRegister':
                return <Redirect to='/register/volunteer' />
            case 'sRegister':
                return <Redirect to='/register/student' />
        }

        return(
            <Grid>
                <Grid.Column width={2} stretched>
                    <Navbar changePage={this.changePage} />
                </Grid.Column>
                <Grid.Column width={12} stretched>
                    <Image src={imgHead} fluid style={{marginBottom:'20px' }}/>
                    <Divider hidden />
                        { this.state.activePage === 'Home' && <Home />}
                        {}
                </Grid.Column>
            </Grid>
        )
    }
}

export default Main
