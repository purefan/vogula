import React from 'react';
import './Database.css';

import Connection from './Connection.js';

class Database extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			connections: [],
			display: [],
			index: 0
		};
	}

    handleClick = () => {
        if(this.state.connections.length === 4){
            alert("Max four connections");
            return;
        }
		let index = this.state.index;
		const connections = this.state.connections;
		connections.push({ node: index, port: null });
		this.setState({ connections: connections, index: ++index });
		this.updateDisplay();
	}

	handleRemove = (data) => {
		const connections = this.state.connections;
		for(let i = 0; i < connections.length; i++){
			if(connections[i].node === Number(data))
				connections.splice(i, 1);
		}
		this.setState({ connections : connections});
		this.updateDisplay();
	}

	handleEdit = (data) => {
		const editConnections = this.state.connections;
		for(let i = 0; i < editConnections.length; i++){
			if(editConnections[i].node === Number(data))
				alert(`To edit settings screen for DB #${data}`);
		}
		this.setState({ connections : editConnections});
		this.updateDisplay();
	}

	updateDisplay = () => {
		const newDisplay = [];
		for(let element of this.state.connections){

			newDisplay.push((<Connection 
							  key={element.node}
							  node={element.node}
							  onEdit={this.handleEdit}
							  onRemove={this.handleRemove}
							 />));
		}
		this.setState({ display: newDisplay });
	}

	render() {
		return (
			<div>
				<div className="header">
					<span className="logo">vogula</span>
	        		<a className="add-button" onClick={this.handleClick}>Add Database</a>
	            </div>
		        <div className="Database">
	                <div className="container">{this.state.display}</div>
	            </div>
            </div>
	    );
    }
}

export default Database;
