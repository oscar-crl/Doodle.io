import React from "react";

class Info extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            word: ''
        }
    }

    componentDidMount() {
        this.props.socket.on('word', (word) => {
            this.setState({word: word});
        })
    }

    render() {
        return (
            <div id={"containerInfo"}>
                <div id={"room-info"}>
                    <div id={"room"}>In room: {this.props.current.room}</div>
                    <div id={"word"}>{this.state.word}</div>
                </div>
            </div>
        )
    }
}

export default Info