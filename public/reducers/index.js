import { combineReducers } from 'redux';
import ChannelsReducer from './reducer_channels';
// import ChatReducer from './reducer_chat';
// import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
  channels: ChannelsReducer
});

export default rootReducer;