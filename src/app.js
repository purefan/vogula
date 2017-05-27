import React from 'react';
import {BrowserRouter as Router, Route } from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';
// Styles
import './app.css';
// Components
import Header from './components/header';
import Home from './containers/home';
import AddConnection from './containers/add-connection';
import EditConnection from './containers/edit-connection';

class App extends React.Component {

	render() {
		return (
			<Provider store={store}>
				<Router>
				<div className="App">
					<Header />
					<Route exact path="/" render={() => <Home />} />
					<Route path="/add" render={() => <AddConnection />} />
					<Route path="/manage" render={() => <EditConnection />} />
				</div>
				</Router>
			</Provider>
		);
	}
}

export default App;
