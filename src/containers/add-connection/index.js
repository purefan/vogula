import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
// Styles
import './index.css';

class AddConnection extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			title: '',
			user: '',
			database: '',
			password: '',
			host: 'localhost',
			port: '5432',
			max: '10',
			idleTimeoutMillis: '30000'
		}
	}
	
	handleChange = (evt) => {
		this.setState({ [evt.target.name] : evt.target.value })
	}
	
	handleClick = () => {
		this.props.actions.addConnection(this.state);
		this.setState({
			title: '',
			user: '',
			database: '',
			password: '',
			host: 'localhost',
			port: '5432',
			max: '10',
			idleTimeoutMillis: '30000'
		});
	}
	
	render() {
		return (
	        <div className="AddConnection">
                <form>
	        		<h3>New Connection Settings</h3>
                	<label>Title</label>
                	<input 
                	type="text" 
                	name="title" 
                	onChange={this.handleChange} 
                	value={this.state.title}/>
                	<label>User</label>
                	<input 
                	type="text" 
                	name="user" 
                	onChange={this.handleChange} 
                	value={this.state.user}/>
                	<label>Database</label>
                	<input 
                	type="text" 
                	name="database" 
                	onChange={this.handleChange} 
                	value={this.state.database}/>
                	<label>Password</label>
                	<input 
                	type="password" 
                	name="password" 
                	onChange={this.handleChange} 
                	value={this.state.password}/>
                	<label>Host</label>
                	<input 
                	type="text" 
                	name="host" 
                	onChange={this.handleChange} 
                	value={this.state.host}/>
                	<label>Port</label>
                	<input 
                	type="text" 
                	name="port" 
                	onChange={this.handleChange} 
                	value={this.state.port}/>
                	<label>Pool Size</label>
                	<input 
                	type="text" 
                	name="max" 
                	onChange={this.handleChange} 
                	value={this.state.max}/>
                	<label>Timeout length (Ms)</label>
                	<input 
                	type="text" 
                	name="idleTimeoutMillis" 
                	onChange={this.handleChange} 
                	value={this.state.idleTimeoutMillis}/>
                	<div className="block">
            			<div 
            			className="button pull-right" 
            			onClick={this.handleClick}> Complete </div>
            		</div>
                </form>
            </div>
	    );
    }
}

const mapStateToProps = state => ({
	connections: state.connections	
});

const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddConnection);
