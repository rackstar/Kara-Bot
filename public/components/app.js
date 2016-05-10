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
  componentDidMount() {
    // In this case, the lock and token are retrieved from the parent component
    // If these are available locally, use `this.lock` and `this.idToken`
    if(this.props.idToken) {
      this.props.lock.getProfile(this.props.idToken, function (err, profile) {
        if (err) {
          console.log("Error loading the Profile", err);
          return;
        }
        this.setState({profile: profile});
      }.bind(this));
    }
  }

  signOut() {
    localStorage.removeItem('userToken');
    this.setState({idToken: this.getIdToken()});
    this.context.router.push('/');
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
          <Header lock={this.lock} idToken={this.state.idToken} />
          <div>
            <a className="btn btn-danger" onClick={this.signOut.bind(this)}>Sign Out</a>
          </div>
          {this.props.children}
        </div>
      );
    } else {
      return (
        <div>
          <Header />
          <div className="login-box">
            <a className="btn btn-primary" onClick={this.showLock.bind(this)}>Sign In</a>
          </div>
          <h3>Please sign in...</h3>
        </div>
      );
    }
  }
}
