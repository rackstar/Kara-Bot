import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

export default class NavHeader extends Component {
  render() {
    return (
      <nav className="navbar navbar-default navbar-static-top">
        <div>
          <ul className="nav navbar-nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="chat">Chat</Link></li>
            <li><Link to="users">Users</Link></li>
            <li><Link to="activity">Activity</Link></li>
            <li><Link to="config">Config</Link></li>
          </ul>
        </div>
      </nav>
    );
  }
}