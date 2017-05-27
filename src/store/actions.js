import * as types from './constants';
import uuidV4 from 'uuid/v4';

export const addConnection = (connection) => ({
    type: types.ADD_CONNECTION,
    id: uuidV4(),
    connection
});

export const editConnection = (id, connection) => ({
    type: types.EDIT_CONNECTION,
    id,
    connection
});

export const removeConnection = (id) => ({
    type: types.REMOVE_CONNECTION,
    id
});
