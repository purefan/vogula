import React from 'react';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username:'',
			password:''
		};
	}

	onClick = () => {
		this.props.setUser(this.state.username, this.state.password);
	}

	updateValues = (evt) => {
		this.setState({ [evt.target.name]: evt.target.value });
	}

	render() {
		return (
			<div>
				<input
				type='text'
				placeholder='username'
				name='username'
				value={this.state.username}
				onChange={this.updateValues}
				/>
				<input
				type='password'
				placeholder='password'
				name='password'
				value={this.state.password}
				onChange={this.updateValues}
				/>

				<button onClick={this.onClick}>Login</button>
				<div>
					User: {this.props.user}
				</div>
			</div>
			);
		}
	}

export default Login;
