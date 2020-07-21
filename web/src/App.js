import React from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import './App.css';
import Game from "./game";
import Login from "./login";

function App() {

    return (
        <div className="App">
            <header className="App-header">
                <Router>
                    <Switch>
                        <Route exact path={"/"} component={Login}/>
                        <Route path={"/doodle.io"} component={Game}/>
                    </Switch>
                </Router>
            </header>
        </div>
    );
}

export default App;
