const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

var room = require('./room');
var player = require('./player');
var utils = require('./utils');

var Rooms = [];

io.on('connection', function (socket) {

    socket.on('drawing', (data) => socket.to(socket['room']).emit('drawing', data));

    socket.on('connection', (data) => {
        if (!data.room || !data.name)
            return;
        if (!Rooms[data.room]) {
            Rooms[data.room] = new room(data.room, data.secret);
            Rooms[data.room].players.push(new player(socket, data.name, true));
            Rooms[data.room].words = utils.generateRdmWords();
            socket.join(data.room);
            socket['room'] = data.room;
            socket['name'] = data.name;
            io.in(data.room).emit('chat', {user: data.name, connected: true});
            socket.emit('draw', Rooms[data.room].words);
            socket.emit('players', [{name: data.name, score: 0}]);
            io.emit('rooms', utils.getListOfRooms(Rooms));
        } else {
            Rooms[data.room].players.push(new player(socket, data.name, false));
            socket.join(data.room);
            socket['room'] = data.room;
            socket['name'] = data.name;
            io.in(data.room).emit('chat', {user: data.name, connected: true});
            socket.emit('guess', Rooms[data.room].players[Rooms[data.room].drawing].name);
            if (Rooms[data.room].word)
                socket.emit('word', Rooms[data.room].hiddenWord);
            io.in(data.room).emit('players', utils.getListOfPlayers(Rooms[data.room]));
        }
    });

    socket.on('disconnect', () => {
        if (!Rooms[socket['room']])
            return;
        if (Rooms[socket['room']].players.length === 1) {
            Rooms[socket['room']].skipRound(io);
            let roomTmp = [];
            Object.values(Rooms).forEach(room => {
                if (room.name !== socket['room'])
                    roomTmp[room.name] = room;
            });
            Rooms = roomTmp;
            io.emit('rooms', utils.getListOfRooms(Rooms));
            return;
        }
        if (Rooms[socket['room']].players[Rooms[socket['room']].drawing].name === socket['name']) {
            Rooms[socket['room']].drawing -= 1;
            Rooms[socket['room']].players = Rooms[socket['room']].players.filter(p => p.name !== socket['name']);
            Rooms[socket['room']].skipRound(io);
        } else {
            Rooms[socket['room']].players = Rooms[socket['room']].players.filter(p => p.name !== socket['name']);
        }
        io.in(socket['room']).emit('chat', {user: socket['name'], disconnected: true});
        io.in(socket['room']).emit('players', utils.getListOfPlayers(Rooms[socket['room']]));
    });

    socket.on('word', (word) => {
        Rooms[socket['room']].word = word;
        Rooms[socket['room']].hiddenWord = utils.hideWord(word.cleanString());
        socket.to(socket['room']).emit('word', Rooms[socket['room']].hiddenWord);
        socket.emit('word', word);
        Rooms[socket['room']].clockInterval = setInterval(() => {
            Rooms[socket['room']].clock -= 1000;
            io.in(socket['room']).emit('clock', Rooms[socket['room']].clock);
        }, 1000);
        Rooms[socket['room']].hintTimeout = setTimeout(() => {
            Rooms[socket['room']].hiddenWord = utils.hideWord(word.cleanString(), true);
            socket.to(socket['room']).emit('word', Rooms[socket['room']].hiddenWord);
        }, 30000);
        Rooms[socket['room']].skipTimeout = setTimeout(() => {
            Rooms[socket['room']].skipRound(io);
        }, 60000);
    });

    socket.on('chat', (message) => {
        const tmpRoom = Rooms[socket['room']];
        if (!message.user || !message.text || Rooms[socket['room']].players.find(p => p.name === message.user).foundWord)
            return;
        if (message.user !== tmpRoom.players[tmpRoom.drawing].name && message.text.cleanString() === tmpRoom.word.cleanString()) {
            io.in(socket['room']).emit('chat', {user: message.user, text: message.text, found: true});
            Rooms[socket['room']].playerFoundWord(message.user);
            io.in(socket['room']).emit('players', utils.getListOfPlayers(Rooms[socket['room']]));
            Rooms[socket['room']].checkEndRound(io);
        } else if (message.user !== tmpRoom.players[tmpRoom.drawing].name && utils.compareWordsWithTolerance(message.text.cleanString(), tmpRoom.word.cleanString())) {
            socket.emit('chat', {text: message.text, close: true});
        } else {
            io.in(socket['room']).emit('chat', message);
        }
    });

    socket.on('clear', () => io.in(socket['room']).emit('clear'));

    socket.on('room', () => {
        console.log(Rooms);
    });

    socket.on('rooms', () => socket.emit('rooms', utils.getListOfRooms(Rooms)));
});

String.prototype.cleanString = function () {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

http.listen(port, () => console.log('listening on port ' + port));
