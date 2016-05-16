import React, { Component } from 'react';
import { Link } from 'react-router';

export default class NavHeader extends Component {
  componentDidMount() {
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

  render() {
    if(this.props.idToken) {
      return (
      <div className="navbar navbar-default navbar-fixed-top" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
            <span className="sr-only"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
        </div>
        <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/activity">Activity</Link></li>
            <li><Link to="/config">Config</Link></li>
          </ul>
          <a type="button" onClick={this.props.signOut} className="btn btn-danger navbar-btn navbar-right signin">Sign Out</a>
        </div>
      </div>
    );
    } else {
      return (
        <div className="navbar navbar-default navbar-fixed-top" role="navigation">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
          </div>
          <div className="navbar-collapse collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/chat">Chat</Link></li>
              <li><Link to="/users">Users</Link></li>
              <li><Link to="/activity">Activity</Link></li>
              <li><Link to="/config">Config</Link></li>
            </ul>
            <a type="button" onClick={this.props.signIn} className="btn btn-info navbar-btn navbar-right signin">Sign In</a>
            <p className="navbar-text navbar-right">Please sign in...</p>
          </div>
        </div>
      );
    }
  }
}

