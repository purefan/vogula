import { combineReducers, createStore } from 'redux';
import { connectionReducer } from './reducers';

const initialState = ({
    connections: []
});

const rootReducer = combineReducers({
   connections : connectionReducer 
});

const store = createStore(rootReducer, initialState);

export default store;
