import React from 'react';
import './Connection.css';

class Connection extends React.Component {
	
	handleEdit = () => {
	    this.props.onEdit(this.props.node);
	}
	
	handleRemove = () => {
	    this.props.onRemove(this.props.node);
	}
	
	render() {
		return (
			<div className="Database">
                <h3>Database {this.props.node}</h3>
                <hr />
                <p>This is a database connection</p>
                <p>url: http://mypgconn.com:port</p>
                <button className="pull-right" onClick={this.handleRemove}>Disconnect</button>
                <a className="edit-link" onClick={this.handleEdit}>Edit Settings</a>
            </div>
	    );
    }
}

export default Connection;
	