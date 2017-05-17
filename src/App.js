import React from 'react';

import Login from './login/Login';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {user:''};
	}

	onChange = (user, password) => {
		// TODO: Perform validation
		const loginVal = {
			user: "purefan2",
			password: "password"
		};
		if(loginVal.user === user && loginVal.password === password){
			this.setState({user: user});
		}
		//console.log(document.querySelector('input'));
	};

	render() {
		return (
			<div>
				<Login 
				user={this.state.user}
				setUser={this.onChange}
				/>
			</div>
		);
	}
}

export default App;
