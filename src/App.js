import React from 'react';
import './App.css';

import Database from './database/Database.js';

class App extends React.Component {

	render() {
		return (
			<div className="App">
				<Database />
			</div>
		);
	}
}

export default App;
