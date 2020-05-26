import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Home from './routes/Home';
import ModelPage from './routes/ModelPage';
import Create from './routes/Create';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const App = () => (
  <Router history={history}>
    <Route exact path="/" component={Home}/>
    <Route exact path="/create" component={Create}/>
    <Route path='/model/:id' component={ModelPage} />
  </Router>
)

export default App;
