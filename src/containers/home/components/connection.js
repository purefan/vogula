import React from 'react';
import './connection.css';

class Connection extends React.Component {

	handleDelete = (evt) => {
		this.props.onDelete(this.props.connection.id);
	}
	
	handleConnect = (evt) => {
		this.props.onConnect(this.props.index);
	}
	
	render() {
		const { connection } = this.props;
		return (
			<div className="Connection">
                <span>
	                <span 
	                className="delete-button pull-right"
	                onClick={this.handleDelete}> Delete </span>
	                <h3>{`${connection.title}: ${connection.status}`}</h3>
                </span>
                <hr />
                <p>Connection Details:</p>
                <div className="flex-connection-details">
                    <p>{`Database: ${connection.database}`}</p>
	                <p>{`User: ${connection.user}`}</p>
	                <p>{`Host: ${connection.host}`}</p>
	                <p>{`Port: ${connection.port}`}</p>
                </div>
                <span className="button pull-right" onClick={this.handleConnect}>Connect</span>
                <span className="button pull-right" >Disconnect</span>
            </div>
	    );
    }
}

export default Connection;
