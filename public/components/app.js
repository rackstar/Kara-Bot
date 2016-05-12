import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import Header from './nav_header';

export default class App extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    this.lock = new Auth0Lock('nrkQfyejul3jEJJosZJcAqsn4kcBfzvv', 'app50179125.auth0.com');

    this.setState({idToken: this.getIdToken()});
  }

  getIdToken() {
    var idToken = localStorage.getItem('userToken');
    var authHash = this.lock.parseHash(window.location.hash);
    if (!idToken && authHash) {
      if (authHash.id_token) {
        idToken = authHash.id_token
        localStorage.setItem('userToken', authHash.id_token);
        this.context.router.push('/');
      }
      if (authHash.error) {
        console.log("Error signing in", authHash);
        return null;
      }
    }
    return idToken;
  }

  signOut() {
    localStorage.removeItem('userToken');
    this.setState({idToken: this.getIdToken()});
    this.context.router.push('/');
  }


  showLock() {
    this.lock.show({
      callbackURL: window.location.origin,
      responseType: 'token'
    });
  }

  render() {
    if (this.state.idToken) {
      return (
        <div>
          <Header lock={this.lock} idToken={this.state.idToken} signOut={this.signOut.bind(this)} />
          {this.props.children}
        </div>
      );
    } else {
      return (
        <div>
          <Header idToken={this.state.idToken} signIn={this.showLock.bind(this)} />
        </div>
      );
    }
  }
}
