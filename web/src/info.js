import React from "react";

class Info extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            word: '',
            clock: 0
        }
    }

    componentDidMount() {
        this.props.socket.on('word', (word) => {
            this.setState({word: word});
        });
        this.props.socket.on('clock', (time) => {
            this.setState({clock: time});
        });
    }

    handleDisconnect() {
        this.props.socket.disconnect();
        this.props.onDisconnect();
    }

    render() {
        return (
            <div id={"containerInfo"}>
                <div id={"room-info"}>
                    <div><i className="fas fa-gamepad"/> {this.props.current.room}</div>
                    <div><i className="fas fa-clock"/> {this.state.clock / 1000}</div>
                    <div id={"word"}><i className="fas fa-search"/> {this.state.word}</div>
                    <div id={"quit"}><i className="fas fa-times" onClick={this.handleDisconnect.bind(this)}/></div>
                </div>
            </div>
        )
    }
}

export default Info