import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
// Styles
import './index.css';
// Components
import ListConnection from './components/list-connection';
import EditForm from './components/edit-form';

class EditConnection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active : null
		};
	}

	handleClick = (key) => {
		this.setState({ active: key });
	}

    handleSave = (value) => {
        this.props.actions.editConnection(
        	this.props.connections[this.state.active].id, value);
        this.setState({ active: null });
    }

	render() {
		const { connections } = this.props;
		if(connections.length > 0 && this.state.active !== null){
			return (
		        <div className="ManageConnection">
		        	<ListConnection 
		        	connections={connections} 
		        	onClick={this.handleClick}/>
	                <EditForm 
	                connection={connections[this.state.active]} 
	                onSave={this.handleSave}/>
	            </div>
		    );
		}else{
			return (
		        <div className="ManageConnection">
		        	<ListConnection 
		        	connections={connections} 
		        	onClick={this.handleClick}/>
	            </div>
            );
		}
    }
}

const mapStateToProps = state => ({
	connections: state.connections	
});

const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EditConnection);
