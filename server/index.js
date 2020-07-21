const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var room = require('./room');
var player = require('./player');
var utils = require('./utils');

var Rooms = [];

io.on('connection', function (socket) {

    socket.on('drawing', (data) => socket.to(data.room).emit('drawing', data));

    socket.on('connection', (data) => {
        if (!data.room || !data.name)
            return;
        if (!Rooms[data.room]) {
            Rooms[data.room] = new room(data.room, data.secret);
            Rooms[data.room].players.push(new player(socket, data.name, true));
            Rooms[data.room].words = utils.generateRdmWords();
            socket.join(data.room);
            socket['room'] = data.room;
            io.in(data.room).emit('chat', {user: data.name, connected: true});
            socket.emit('draw', Rooms[data.room].words);
            socket.emit('players', [{name: data.name, score: 0}]);
            io.emit('rooms', utils.getListOfRooms(Rooms));
        } else {
            Rooms[data.room].players.push(new player(socket, data.name, false));
            socket.join(data.room);
            socket['room'] = data.room;
            io.in(data.room).emit('chat', {user: data.name, connected: true});
            socket.emit('guess', Rooms[data.room].players[Rooms[data.room].drawing].name);
            if (Rooms[data.room].word)
                socket.emit('word', Rooms[data.room].hiddenWord);
            io.in(data.room).emit('players', utils.getListOfPlayers(Rooms[data.room]));
        }
    });

    socket.on('word', (word) => {
        Rooms[socket['room']].word = word;
        Rooms[socket['room']].hiddenWord = utils.hideWord(word.cleanString());
        socket.to(socket['room']).emit('word', Rooms[socket['room']].hiddenWord);
        socket.emit('word', word);
        setTimeout(() => {
            if (Rooms[socket['room']].word) {
                Rooms[socket['room']].hiddenWord = utils.hideWord(word.cleanString(), true);
                socket.to(socket['room']).emit('word', Rooms[socket['room']].hiddenWord);
            }
        }, 8000);
    });

    socket.on('link', (data) => {
        Rooms[socket['room']].players.find(p => p.name === data.user).link = socket;
        Rooms[socket['room']].getRoles(data.user);
    });

    socket.on('chat', (message) => {
        const tmpRoom = Rooms[socket['room']];
        if (!message.user || Rooms[socket['room']].players.find(p => p.name === message.user).foundWord)
            return;
        if (message.user !== tmpRoom.players[tmpRoom.drawing].name && message.text.cleanString() === tmpRoom.word.cleanString()) {
            io.in(socket['room']).emit('chat', {user: message.user, text: message.text, found: true});
            Rooms[socket['room']].playerFoundWord(message.user);
            io.in(socket['room']).emit('players', utils.getListOfPlayers(Rooms[socket['room']]));
            Rooms[socket['room']].checkEndRound(io);
        } else if (message.user !== tmpRoom.players[tmpRoom.drawing].name && utils.compareWordsWithTolerance(message.text.cleanString(), tmpRoom.word.cleanString())) {
            Rooms[socket['room']].players.find(p => p.name === message.user).socket.emit('chat', {text: message.text, close: true});
        } else {
            io.in(socket['room']).emit('chat', message);
        }
    });

    socket.on('room', () => {
        console.log(Rooms);
    });

    socket.on('rooms', () => socket.emit('rooms', utils.getListOfRooms(Rooms)));
});

String.prototype.cleanString = function () {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

http.listen(port, () => console.log('listening on port ' + port));
