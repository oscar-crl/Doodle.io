import React from "react";
import {hexToRgb} from "@material-ui/core";
import Slider from '@material-ui/core/Slider';

class SelectColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {color: this.props.current.color, enable: false, eraser: false};
    }

    componentDidMount() {
        this.props.socket.on('draw', () => {
            this.setState({enable: true});
        });
        this.props.socket.on('guess', () => {
            this.setState({enable: false});
        });
    }

    onColorUpdate(colorItem) {
        if (this.state.eraser)
            return;
        this.props.current.color = colorItem;
        this.setState({color: colorItem});
    }

    onDrawTool() {
        this.setState({eraser: false});
        this.props.current.color = this.state.color;
    }

    onEraserTool() {
        this.setState({eraser: true});
        this.props.current.color = 'rgb(255,255,255)';
    }

    onToolSizeChange(size) {
        this.props.current.toolSize = size;
    }

    onClearBoardTool() {
        this.props.socket.emit('clear');
    }

    toolBar(colorList) {
        if (!this.state.enable)
            return <div className={"spacing-v"}/>;
        return <div id={"containerTools"}>
            <div id={"selected-color"} style={{backgroundColor: this.state.color}}/>
            <div id={"colors-list"}>
                {colorList.map((c, i) => <div className="colorItem" style={{backgroundColor: c}} onClick={this.onColorUpdate.bind(this, hexToRgb(c))} key={i}/>)}
            </div>
            <div className={!this.state.eraser ? "tool active" : "tool"} onClick={this.onDrawTool.bind(this)} data-toggle="tooltip" data-placement="top" title="Brush">
                <i className="fas fa-paint-brush"/></div>
            <div className={this.state.eraser ? "tool active" : "tool"} onClick={this.onEraserTool.bind(this)} data-toggle="tooltip" data-placement="top" title="Eraser">
                <i className="fas fa-eraser"/>
            </div>
            <div className="dropup">
                <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Brush Size
                </button>
                <div id="brush-size" className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <Slider
                        orientation="vertical"
                        getAriaValueText={this.onToolSizeChange.bind(this)}
                        defaultValue={6}
                        aria-labelledby="vertical-slider"
                        step={2}
                        min={2}
                        max={40}
                    />
                </div>
            </div>
            <div className={"tool"} onClick={this.onClearBoardTool.bind(this)} data-toggle="tooltip" data-placement="top" title="Clear">
                <i className="fas fa-trash"/>
            </div>
        </div>
    }

    render() {
        const colorList = ['#000', '#FFF', '#C1C1C1', '#EF130B', '#FF7100', '#FFE400', '#00CC00', '#00B2FF', '#231FD3', '#A300BA', '#D37CAA', '#A0522D'];
        return this.toolBar(colorList);
    }
}

export default SelectColor

