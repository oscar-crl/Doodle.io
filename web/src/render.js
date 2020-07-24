import React from "react";
import Login from "./login";
import Game from "./game";

class Render extends React.Component {

    constructor(props) {
        super(props);
        this.state = {username: '', room: ''};
    }

    handleLogin(login) {
        this.setState({username: login.username, room: login.room});
    }

    handleDisconnect() {
        this.setState({username: '', room: ''});
    }

    render() {
        if (!this.state.username || !this.state.room) {
            return <Login onLogin={this.handleLogin.bind(this)}/>
        } else {
            return <Game username={this.state.username} room={this.state.room} onDisconnect={this.handleDisconnect.bind(this)}/>
        }
    }
}

export default Render
