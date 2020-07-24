import React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import io from "socket.io-client";

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {name: '', room: '', rooms: []};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.socket = io(process.env.REACT_APP_SERVER_URL);
        this.socket.emit('rooms');
        this.socket.on('rooms', (rooms) => this.setState({rooms: rooms}));
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event) {
        if (!this.state.name || !this.state.room || !this.socket.connected)
            return;
        this.socket.disconnect();
        this.props.onLogin({username: this.state.name, room: this.state.room});
        event.preventDefault();
    }

    selectRoom(name) {
        this.state.rooms.find(r => r.active === true ? r.active = false : '');
        this.state.rooms.find(r => r.name === name ? r.active = true : '');
        this.setState({room: name});
    }

    appendRoom(room, i) {
        return <div key={i} className={room.active ? 'active' : ''} onClick={this.selectRoom.bind(this, (room.name))}>{room.name} - {room.players}</div>;
    }

    roomExists() {
        return this.state.rooms.find(r => r.name === this.state.room);
    }

    render() {
        const rooms = this.state.rooms.map((room, i) => this.appendRoom(room, i));
        return <Container fluid>
            <Row className="justify-content-center">
                <div id={"connect-room"}>
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <input type="text" className="form-control" placeholder="Enter username" name="name"
                                   onChange={this.handleChange}/>
                        </div>
                        <div className="form-group">
                            <input type="text" className="form-control" placeholder="Enter room name" name="room"
                                   onChange={this.handleChange}/>
                        </div>
                        <button type="submit" className="btn btn-primary">{this.roomExists() ? "Join " : "Create "} {this.state.room}</button>
                    </form>
                </div>
                <div id={"rooms-list"}>
                    <div id={"rooms-list-header"}>Server name / players</div>
                    <hr/>
                    <div id={"choose-room"}>
                        {rooms}
                    </div>
                </div>
            </Row>
        </Container>;
    }
}

export default Login