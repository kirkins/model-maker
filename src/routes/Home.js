import React, { Component } from 'react'
import ModelList from '../components/ModelList';
import TopBar from '../components/TopBar';
import AboutJumbotron from '../components/AboutJumbotron';

class Home extends Component {
render () {
  return (
    <div className="App">
      <TopBar/>
      <AboutJumbotron/>
      <h1>Current Models</h1><br/>
      <ModelList/>
    </div>
  );
}
}

export default Home;
