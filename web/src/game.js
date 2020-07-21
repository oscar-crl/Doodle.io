import React from "react";
import GameBoard from "./gameboard";
import Chat from "./chat";
import ChatSend from "./chatTextField";
import SelectColors from "./color";
import InfoGame from "./info";
import ListPlayer from "./players";
import io from "socket.io-client";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

function Game(props) {

    const socket = io('http://localhost:3000');
    let current = {color: 'black', username: props.location.username, room: props.location.room};

    console.log("game: " + current.username + " : " + current.room);

    socket.emit('connection', {name: current.username, room: current.room, pass: '1234'});

    return <Container fluid>
        <Row className="justify-content-center">
            <InfoGame socket={socket} current={current}/>
        </Row>
        <Row className="justify-content-center">
            <ListPlayer socket={socket} current={current}/>
            <div id={"containerDraw"}>
                <GameBoard socket={socket} current={current}/>
                <SelectColors current={current}/>
            </div>
            <div id={"containerChat"}>
                <div id={"chat-box"}>
                    <Chat socket={socket} current={current}/>
                    <div id={"chatTextField-box"}><ChatSend socket={socket} current={current}/></div>
                </div>
            </div>
        </Row>
    </Container>;
}

export default Game