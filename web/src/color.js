import React from "react";

class SelectColor extends React.Component {

    onColorUpdate(colorItem) {
        this.props.current.color = colorItem;
    }

    render() {
        return <div className="colors">
            <div className="colorItem" style={{backgroundColor: 'black'}}
                 onClick={this.onColorUpdate.bind(this, "black")}/>
            <div className="colorItem" style={{backgroundColor: 'red'}} onClick={this.onColorUpdate.bind(this, "red")}/>
            <div className="colorItem" style={{backgroundColor: 'green'}}
                 onClick={this.onColorUpdate.bind(this, "green")}/>
            <div className="colorItem" style={{backgroundColor: 'blue'}}
                 onClick={this.onColorUpdate.bind(this, "blue")}/>
            <div className="colorItem" style={{backgroundColor: 'yellow'}}
                 onClick={this.onColorUpdate.bind(this, "yellow")}/>
        </div>;
    }
}

/*<div className="colorItem" style="background: #FFF"></div>
            <div className="colorItem" style="background: #C1C1C1"></div>
            <div className="colorItem" style="background: #EF130B"></div>
            <div className="colorItem" style="background: #FF7100"></div>
            <div className="colorItem" style="background: #FFE400"></div>
            <div className="colorItem" style="background: #00CC00"></div>
            <div className="colorItem" style="background: #00B2FF"></div>
            <div className="colorItem" style="background: #231FD3"></div>
            <div className="colorItem" style="background: #A300BA"></div>
            <div className="colorItem" style="background: #D37CAA"></div>
            <div className="colorItem" style="background: #A0522D"></div>*/

export default SelectColor

