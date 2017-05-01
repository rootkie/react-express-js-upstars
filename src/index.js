import React from 'react';
import ReactDOM from 'react-dom';

import createBrowserHistory from 'history/createBrowserHistory'
const customHistory = createBrowserHistory()

import Routes from './routes';
import './index.css';

ReactDOM.render((
  <Routes history={customHistory}/>
),document.getElementById('root'));