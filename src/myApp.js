import React from 'react'
import UserList from './user-select/userlist'
// import User from './user-select/user'

class MyApp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {user:''}
		this.handle_user_change = this.handle_user_change.bind(this)
		console.log(this.handle_user_change)
	}

	handle_user_change(user) {
		// ToDo: Perform validation
		this.setState({user: "new user"})
		console.log(document.querySelector('input'))

	}

	render() {
		const user = "purefan2"

		console.log(user)
		return (
			<div>
				{!!user ? 
					<UserList 
						user={this.state.user}
						set_user={this.handle_user_change}
					/> : "user no" }
			</div>
		)
	}
}


export default MyApp