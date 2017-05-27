import React from 'react';

// Styles
import './edit-form.css';

class EditForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: this.props.connection.id,
			title: this.props.connection.title,
			user: this.props.connection.user,
			database: this.props.connection.database,
			password: this.props.connection.password,
			host: this.props.connection.host,
			port: this.props.connection.port,
			max: this.props.connection.max,
			idleTimeoutMillis: this.props.connection.idleTimeoutMillis,
			status: this.props.connection.status
		}
	}

    handleSave = () => {
        this.props.onSave(this.state);
    }

    handleChange = (evt) => {
        this.setState({ [evt.target.name]: evt.target.value })
    }

	render() {
	    const { connection } = this.props;
		return (
	        <div className="EditForm">
                <form>
	        		<h3>Edit Connection Settings</h3>
                	<label>Title</label>
                	<input 
                	type="text" 
                	name="title" 
                	onChange={this.handleChange} 
                	defaultValue={connection.title}/>
                	<label>User</label>
                	<input 
                	type="text" 
                	name="user" 
                	onChange={this.handleChange} 
                	defaultValue={connection.user}/>
                	<label>Database</label>
                	<input 
                	type="text" 
                	name="database" 
                	onChange={this.handleChange} 
                	defaultValue={connection.database}/>
                	<label>Password</label>
                	<input 
                	type="password" 
                	name="password" 
                	onChange={this.handleChange} 
                	defaultValue={connection.password}/>
                	<label>Host</label>
                	<input 
                	type="text" 
                	name="host" 
                	onChange={this.handleChange} 
                	defaultValue={connection.host}/>
                	<label>Port</label>
                	<input 
                	type="text" 
                	name="port" 
                	onChange={this.handleChange} 
                	defaultValue={connection.port}/>
                	<label>Pool Size</label>
                	<input 
                	type="text" 
                	name="pool" 
                	onChange={this.handleChange} 
                	defaultValue={connection.max}/>
                	<label>Timeout length (Ms)</label>
                	<input 
                	type="text" 
                	name="timeout" 
                	onChange={this.handleChange} 
                	defaultValue={connection.idleTimeoutMillis}/>
                	<div className="block">
                	    <div 
                	    className="button pull-right" 
                	    onClick={this.handleSave}> Save </div>
            		</div>
                </form>
            </div>
	    );
    }
}

export default EditForm;
