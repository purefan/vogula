import React from 'react';

// Styles
import './list-connection.css';

class ListConnection extends React.Component {

    handleClick = (evt) => {
        this.props.onClick(evt.target.value);
    }

	render() {
		const { connections } = this.props;
		if(connections.length > 0){
		return (
	        <ul className="ListConnection">
	            <h3>Connections</h3>
	        	{connections.map((conn,index) => 
                <li 
                key={index} 
                value={index} 
                onClick={this.handleClick}>{conn.title}</li>
                )}
            </ul>
	    );
		}else{
		    return <h3 className="no-connection"> No Connections </h3>;
		}
    }
}

export default ListConnection;
