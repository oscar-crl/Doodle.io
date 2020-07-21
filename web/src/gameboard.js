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
        this.state = {wait: false, link: true};
    }

    componentDidMount() {
        this.canvas = findDOMNode(this.canvasRef);
        this.w = this.canvas.clientWidth;
        this.h = this.canvas.clientHeight;
        this.ctx = this.canvasRef.getContext('2d');
        this.props.socket.on('drawing', this.onDrawingEvent.bind(this));
        this.props.socket.on('guess', (player) => {
            this.guess = true;
            this.playerDrawing = player;
            this.setState({wait: true});
        });
        this.props.socket.on('draw', (words) => {
            this.guess = false;
            this.words = words;
            this.setState({wait: true});
            console.log('draw ' + this.words);
        });
        this.props.socket.on('word', (word) => {
            console.log(word);
            this.setState({wait: false});
        });
        this.props.socket.on('link', () => {
            this.setState({link: true});
        });
    }

    drawLine(x0, y0, x1, y1, color, emit) {
        //const {top, left} = this.canvasRef.getBoundingClientRect();
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();

        if (!emit) {
            return;
        }

        this.props.socket.emit('drawing', this.props.current.room, {
            x0: x0 / this.w,
            y0: y0 / this.h,
            x1: x1 / this.w,
            y1: y1 / this.h,
            color: color
        });
    }

    onMouseDown(e) {
        if (this.guess || this.state.wait)
            return;
        //this.drawing = true;
        this.props.current.x = e.clientX;
        this.props.current.y = e.clientY;
    }

    onMouseUp(e) {
        if (!this.drawing) {
            return;
        }
        this.drawing = false;
        this.drawLine(this.props.current.x, this.props.current.y, e.clientX, e.clientY, this.props.current.color, true);
    }

    onMouseMove(e) {
        if (!this.drawing) {
            return;
        }
        this.drawLine(this.props.current.x, this.props.current.y, e.clientX, e.clientY, this.props.current.color, true);
        this.props.current.x = e.clientX;
        this.props.current.y = e.clientY;
    }

    throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function () {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    onDrawingEvent(data) {
        this.drawLine(data.x0, data.y0, data.x1, data.y1, data.color);
    }

    sendWord(word) {
        this.props.socket.emit('word', word);
        this.setState({wait: false});
    }

    selectWord() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        return <div className={"wait-box"} id={"choose-word"}><p>Choose a word to draw!</p>
            <div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[0])}>{this.words[0]}</div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[1])}>{this.words[1]}</div>
                <div className={"selectWord"} onClick={this.sendWord.bind(this, this.words[2])}>{this.words[2]}</div>
            </div>
        </div>;
    }

    waitWordSelect() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
        return <div className={"wait-box"}><p id={"wait-player"}>{this.playerDrawing} is choosing a word</p></div>
    }

    waitLink() {
        return <div className={"wait-box"}><p>Please connect mobile to start playing</p></div>
    }

    render() {
        return (
            <div id={"canvas-wrapper"}>
                {!this.state.link ? this.waitLink() : ''}
                {this.state.wait && this.state.link && this.words && this.guess ? this.waitWordSelect() : ''}
                {this.state.wait && this.state.link && !this.guess ? this.selectWord() : ''}
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