import { connectionReducer } from '../store/reducers.js';
import * as actions from '../store/actions';

const initialState = [];

it('no action', () => {
  const actual = connectionReducer(initialState, 'no action');
  const expected = [];
  expect(actual).toEqual(expected);
});

it('add action', () => {
  
  const connection = {
            title: 'A db connection',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000
        };
  
  const action = actions.addConnection(connection);
  
  const actual = connectionReducer(initialState, action);
  const expected = [
        {
            id: action.id,
            title: 'A db connection',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000,
            status: 'offline'
        }
  ];
  expect(actual).toEqual(expected);
});

it('edit action', () => {
  
  const connection = {
            title: 'A db connection',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000
        };
  
  const actionAdd = actions.addConnection(connection);
  
  const state = connectionReducer(initialState, actionAdd);
  
  const edit = {
            id: actionAdd.id,
            title: 'A db connection 1',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000,
            status: 'offline'
        };
  
  const action = actions.editConnection(actionAdd.id, edit);
  
  const actual = connectionReducer(state, action);
  
  const expected = [
        {
            id: actionAdd.id,
            title: 'A db connection 1',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000,
            status: 'offline'
        }
  ];
  expect(actual).toEqual(expected);
});

it('remove action', () => {
  
  
  const connection = {
            title: 'A db connection',
            user: 'foo',
            database: 'my_db',
            password: 'secret',
            host: 'localhost',
            port: 5432,
            max: 10,
            idleTimeoutMillis: 30000,
        };
  
  const actionAdd = actions.addConnection(connection);
  
  const state = connectionReducer(initialState, actionAdd);
  
  const action = actions.removeConnection(actionAdd.id);
  
  const actual = connectionReducer(state, action);
  
  const expected = [];
  
  expect(actual).toEqual(expected);
});
