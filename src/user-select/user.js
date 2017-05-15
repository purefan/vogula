import React from 'react'

/*class User extends React.Component {
	render(user) {
		return (
			<li
				class="user-select"
			>
				{user.name}
			</li>
		)
	}
}*/

function User(props) {
	return <p> The user is {props.user}</p>
}

/*
User.propTypes = {
	onClick: PropTypes.func.isRequired,
	username: PropTypes.String.isRequired
}*/

export default User