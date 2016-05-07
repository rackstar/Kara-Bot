import React, { Component } from 'react';
import { Link } from 'react-router';

import Header from './nav_header';

export default class App extends Component {
  render() {
    return (
      <div>
        <Header />
        {this.props.children}
      </div>
    );
  }
}
