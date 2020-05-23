import React from 'react';
import './App.css';
import {Switch,Route} from "react-router-dom";
import CreatePoll from './CreatePoll'
import Poll from './Poll'
function App() {
  return (
    <Switch>
      <Route exact path="/">
        <CreatePoll />
      </Route>
      <Route path="/poll/:id">
        <Poll/>
      </Route>  
    </Switch>
  )
}


export default App;