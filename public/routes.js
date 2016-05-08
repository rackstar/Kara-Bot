import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/app';
import ChatLogs from './components/chat_logs';
import UsersList from './components/users_list';
import BotActivity from './components/bot_activity';
import BotConfig from './components/bot_config';

export default (
  <Route path='/' component={App}>
    <Route path='chat' component={ChatLogs} />
    <Route path='users' component={UsersList} />
    <Route path='activity' component={BotActivity} />
    <Route path='config' component={BotConfig} />
  </Route>
);