import React, { Component } from 'react';

export default class UsersList extends Component {

  render() {
    return (
      <div>
        <h1>Users</h1>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>User</th>
              <th>Slack ID</th>
              <th>GitHub</th>
              <th>JIRA ID</th>
              <th>Other?</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
            <tr><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td><td>Temp</td></tr>
          </tbody>
        </table>
      </div>
    );
  }
}