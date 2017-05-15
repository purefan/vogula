import React from 'react'
// import User from './user'

function UserList(props) {
	const username = props.user
	const set_user = props.set_user
	console.log(props)
	return (
		<div>
			<button onClick={props.set_user}>Change it</button>
			The user is {username}
		</div>
	)
}
export default UserList