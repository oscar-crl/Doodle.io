import React from "react";

class Players extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            players: [],
        }
    }

    componentDidMount() {
        this.props.socket.on('players', (player) => {
            this.setState({players: player});
        });
    }

    appendPlayer(player, i) {
        if (player.name === this.props.current.username)
            return <div key={i} className={"player-box-me"}><div className="user">{player.name}</div><div className="score">Score: {player.score}</div></div>;
        return <div key={i} className={"player-box"}><div className="user">{player.name}</div><div className="score">Score: {player.score}</div></div>;
    }

    render() {
        const players = this.state.players.map((player, i) => this.appendPlayer(player, i));
        return (
            <div id={"containerPlayers"}>
                <div id={"list-player"}>
                    {players}
                </div>
            </div>
        )
    }
}

export default Players