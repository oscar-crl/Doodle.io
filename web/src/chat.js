import React from "react";

class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            chatMessages: []
        }
        this.messagesEndRef = React.createRef()
    }

    componentDidMount() {
        this.props.socket.on('chat', (message) => {
            this.setState(state => ({
                chatMessages: [...state.chatMessages, message]
            }));
            this.scrollToBottom();
        });
    }

    messageFormat(msg, i) {
        if (msg.connected)
            return <p key={i}><span className="user-connected">{msg.user} joined the game!</span></p>;
        else if (msg.disconnected)
            return <p key={i}><span className="user-disconnected">{msg.user} left the game.</span></p>;
        else if (msg.found)
            return <p key={i}><span className="user-win">{msg.user} found the word!</span></p>;
        else if (msg.close)
            return <p key={i}><span className="user-close">'{msg.text}' is close!</span></p>;
        else if (msg.end)
            return <p key={i}><span className="end-round">The word was '{msg.text}'</span></p>;
        return <p key={i}><span className="user">{msg.user}:</span> {msg.text}</p>;
    }

    scrollToBottom = () => {
        this.messagesEndRef.current.scrollIntoView();
    }

    render() {
        const messages = this.state.chatMessages.map((msg, i) => this.messageFormat(msg, i));
        return (
            <div id={"message-box"}>
                {messages}
                <div ref={this.messagesEndRef} />
            </div>
        )
    }
}

export default Chat