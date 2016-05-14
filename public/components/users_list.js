import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchUsers, fetchUser } from '../actions/index';
import { Link } from 'react-router';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class UsersList extends Component {
  componentWillMount() {
    if(this.props.userid) {
      this.props.fetchUser(this.props.userid);
    } else {
      this.props.fetchUser();
    }
    this.props.fetchUsers();
    this.setState({user:null});
  }

  getUser(user) {
    this.props.fetchChat(user.slack_user_id);
    this.setState({user:user});
  }

  isBot(cell, row) {
    if(cell===true) {
      return 'True';
    } else {
      return 'False';
    }
  }

  render() {
    return (
      <div>
        <h1>Users</h1>
        <BootstrapTable data={this.props.all} striped={true} hover={true} condensed={true} pagination={true} search={true}>
          <TableHeaderColumn dataField="username" isKey={true} dataSort={true}>Username</TableHeaderColumn>
          <TableHeaderColumn dataField="firstname" dataSort={true}>First Name</TableHeaderColumn>
          <TableHeaderColumn dataField="lastname" dataSort={true}>Last Name</TableHeaderColumn>
          <TableHeaderColumn dataField="email" dataSort={true}>Email</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_user_id" dataSort={true}>Slack User ID</TableHeaderColumn>
          <TableHeaderColumn dataField="is_bot" dataSort={true} dataFormat={this.isBot}>Bot User?</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { all: state.users.all, user: state.users.user };
}

export default connect(mapStateToProps, { fetchUsers, fetchUser })(UsersList);
