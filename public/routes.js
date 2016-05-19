import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/app';
import Home from './components/home';
import ChatLogs from './components/chat_logs';
import UsersList from './components/users_list';
import User from './components/user';
import Chart from './components/chart';

export default (
  <Route path='/' component={App}>
    <IndexRoute component={Home} />
    <Route path='chat' component={ChatLogs} />
    <Route path='users' component={UsersList} />
    <Route path='users/:id' component={User} />
    <Route path='chart' component={Chart} />
  </Route>
);