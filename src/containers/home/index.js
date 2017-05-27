import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
// Styles
import './index.css';
// Components
import Connection from './components/connection'; 

class Home extends React.Component {

	handleDelete = (id) => {
		this.props.actions.removeConnection(id);
	}
	
	handleConnect = (index) => {
		// Add code to handle connecting to DB
		
	}
	
	render() {
		const { connections } = this.props;
		if(connections.length > 0){
		return (
	        <div className="Home">
                {connections.map((conn,index) => 
                	<Connection 
						key={index}
						index={index}
						connection={conn}
						onConnect={this.handleConnect}
						onDelete={this.handleDelete}
                	/>
                )}
            </div>
	    );
		}else{
			return(
				<div className="Home">
	                <h3 className="no-connection"> No Connections </h3>
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
