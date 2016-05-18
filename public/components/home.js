import React, { Component } from 'react';
import { Jumbotron } from 'react-bootstrap';

export default class Home extends Component {
  render() {
    return (
      <div>
        <Jumbotron>
          <h1>Welcome to KaraBot!</h1>
          <h3>A Slack Bot to assist with your engineering team's workflow!</h3>
          <p>Let KaraBot help your Engineering team by letting you know when a Pull Request was submitted or merged in
          GitHub, notifying you when a highest priority issue was submitted in JIRA, keeping track of you team's Google
          Calendar, or even just letting you know what the weather is going to be for the next few days!</p>
        </Jumbotron>
      </div>
    );
  }
}
