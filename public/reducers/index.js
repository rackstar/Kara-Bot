import { combineReducers } from 'redux';
import ChannelsReducer from './reducer_channels';
import UsersReducer from './reducer_users';

const rootReducer = combineReducers({
  channels: ChannelsReducer,
  users: UsersReducer
});

export default rootReducer;