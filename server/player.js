class Player {
    constructor(socket, name, host) {
        this.socket = socket;
        this.link = undefined;
        this.name = name;
        this.host = host;
        this.foundWord = false;
        this.score = 0;
    }
}

module.exports = Player;