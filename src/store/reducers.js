import * as types from './constants';

const initialState = {};

export const connectionReducer = (state = initialState, action) => {
    switch(action.type){
        case types.ADD_CONNECTION:
            return [...state, {
                    id: action.id,
                    status: 'offline',
                    ...action.connection
                }
            ];
        case types.EDIT_CONNECTION:
            return state.map(connection => connection.id === action.id ? action.connection : connection);
        case types.REMOVE_CONNECTION:
            return state.filter(connection => connection.id !== action.id);
        default:
            return state;
    }
};
