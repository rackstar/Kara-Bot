import { FETCH_CHANNELS, FETCH_CHAT } from '../actions/index';

const INITIAL_STATE = { channels: [], messages: [] };

export default function(state = INITIAL_STATE, action) {
  switch(action.type) {
    case FETCH_CHANNELS:
      return { ...state, channels: action.payload.data };
    case FETCH_CHAT:
      return { ...state, messages: action.payload.data };
    default:
      return state;
  }
}