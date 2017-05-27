import React from 'react';
import './header.css';
import { Link } from 'react-router-dom';


class Header extends React.Component {
	
	render() {
		return (
	        <div className="Header">
				<span className="logo">vogula</span>
        		<Link to='/manage' 
        		className="button pull-right">Edit Connections</Link>
        		<Link to='/add' 
        		className="button pull-right">Add Connection</Link>
        		<Link to='/' 
        		className="button pull-right">Dashboard</Link>
            </div>
	    );
    }
}

export default Header;
