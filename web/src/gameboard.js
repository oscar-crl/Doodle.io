import React from "react";
import {findDOMNode} from 'react-dom';

class GameBoard extends React.Component {

    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.drawing = false;
        this.guess = true;
        this.playerDrawing = '';
        this.words = [];
        this.state = {wait: false};
    }

    componentDidMount() {
        this.canvas = findDOMNode(this.canvasRef);
        this.w = this.canvas.clientWidth;
        this.h = this.canvas.clientHeight;
        this.ctx = this.canvasRef.getContext('2d');
        this.props.socket.on('drawing', this.onDrawingEvent.bind(this));
        this.props.socket.on('guess', (player) => {
            this.guess = true;
            this.drawing = false;
            this.playerDrawing = player;
            this.setState({wait: true});
        });
        this.props.socket.on('draw', (words) => {
            this.guess = false;
            this.words = words;
            this.setState({wait: true});
            this.selectTimeout = setTimeout(() => {
                this.sendWord(this.words[Math.floor(Math.random() * Math.floor(3))]);
            }, 10000);
        });
        this.props.socket.on('word', () => {
            this.setState({wait: false});
        });
        this.props.socket.on('clear', () => this.clearBoard());
    }

    drawLine(x0, y0, x1, y1, size, color, emit) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = size;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();

        if (!emit || this.guess) {
            return;
        }

        this.props.socket.emit('drawing', {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            size: size,
            color: color
        });
    }

    onMouseDown(e) {
        if (this.guess || this.state.wait)
            return;
        this.drawing = true;
        this.props.current.x = e.clientX;
        this.props.current.y = e.clientY;
    }

    onMouseUp(e) {
        if (!this.drawing) {
            return;
        }
        this.drawing = false;
        const {top, left} = this.canvasRef.getBoundingClientRect();
        this.drawLine(this.props.current.x - left, this.props.current.y - top, e.clientX - left, e.clientY - top, this.props.current.toolSize, this.props.current.color, true);
    }

    onMouseMove(e) {
        if (!this.drawing) {
            return;
        }
        const {top, left} = this.canvasRef.getBoundingClientRect();
        this.drawLine(this.props.current.x - left, this.props.current.y - top, e.clientX - left, e.clientY - top, this.props.current.toolSize, this.props.current.color, true);
        this.props.current.x = e.clientX;
        this.props.current.y = e.clientY;
    }

    throttle(callback, delay) {
        let previousCall = new Date().getTime();
        return function () {
            const time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    onDrawingEvent(data) {
        this.drawLine(data.x0, data.y0, data.x1, data.y1, data.size, data.color);
    }

    sendWord(word) {
        clearTimeout(this.selectTimeout);
        this.props.socket.emit('word', word);
        this.setState({wait: false});
    }

    selectWord() {
        this.clearBoard();
        return <div className={"wait-box"} id={"choose-word"}><p>Choose a word to draw!</p>
            <div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[0])}>{this.words[0]}</div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[1])}>{this.words[1]}</div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[2])}>{this.words[2]}</div>
            </div>
        </div>;
    }

    waitWordSelect() {
        this.clearBoard();
        return <div className={"wait-box"}><p id={"wait-player"}>{this.playerDrawing} is choosing a word</p></div>
    }

    clearBoard() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
    }

    render() {
        return (
            <div id={"canvas-wrapper"}>
                {this.state.wait && this.words && this.guess ? this.waitWordSelect() : ''}
                {this.state.wait && !this.guess ? this.selectWord() : ''}
                <canvas id={"gameBoard"} width="800" height="600"
                        ref={(canvas) => {
                            this.canvasRef = canvas;
                        }}
                        onMouseDown={this.onMouseDown}
                        onMouseUp={this.onMouseUp}
                        onMouseMove={this.onMouseMove}
                        onMouseOut={this.throttle(this.onMouseMove, 10, false)}
                />
            </div>
        );
    }
}

export default GameBoard