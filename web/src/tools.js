import React from "react";
import {hexToRgb} from "@material-ui/core";

class SelectColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {color: this.props.current.color, enable: false};
        this.eraser = false;
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
        if (this.eraser)
            return;
        this.props.current.color = colorItem;
        this.setState({color: colorItem});
    }

    onDrawTool() {
        this.eraser = false;
        this.props.current.color = this.state.color;
    }

    onEraserTool() {
        this.eraser = true;
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
            <div className={"tool"} onClick={this.onDrawTool.bind(this)}/>
            <div className={"tool"} onClick={this.onEraserTool.bind(this)}/>
            <div className={"tool"} onClick={this.onToolSizeChange.bind(this, 6)}/>
            <div className={"tool"} onClick={this.onToolSizeChange.bind(this, 12)}/>
            <div className={"tool"} onClick={this.onClearBoardTool.bind(this)}/>
        </div>
    }

    render() {
        const colorList = ['#000', '#FFF', '#C1C1C1', '#EF130B', '#FF7100', '#FFE400', '#00CC00', '#00B2FF', '#231FD3', '#A300BA', '#D37CAA', '#A0522D'];
        return this.toolBar(colorList);
    }
}

export default SelectColor

