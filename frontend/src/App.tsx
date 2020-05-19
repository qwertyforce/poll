import React from 'react';
import './App.css';
import {Switch,Route} from "react-router-dom";
import CreatePoll from './CreatePoll'
function App() {
  return (
    <Switch>
      <Route exact path="/">
        <CreatePoll />
      </Route>
    </Switch>
  )
}


export default App;