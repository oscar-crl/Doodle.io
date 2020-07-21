import React from "react";

class ChatTextField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.socket.emit('chat',{user: this.props.current.username, text: this.state.value});
        this.setState({value: ''});
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input className="form-control" id="inputChat" autoComplete="off"
                       placeholder="Type your guess here..." maxLength="100" type="text" value={this.state.value}
                       onChange={this.handleChange}/>
            </form>
        );
    }
}

export default ChatTextField