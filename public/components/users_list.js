import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchUsers, fetchUser } from '../actions/index';
import { Link } from 'react-router';
import { PageHeader } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class UsersList extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    if(this.props.userid) {
      this.props.fetchUser(this.props.userid);
    } else {
      this.props.fetchUser();
    }
    this.props.fetchUsers();
    this.setState({user:null});
  }

  isBot(cell, row) {
    if(cell===true) {
      return 'True';
    } else {
      return 'False';
    }
  }
  selectRowProp = {
    mode: 'radio',
    onSelect: (row, isSelected) => {
      this.context.router.push(`users/${row.slack_user_id}`);
    }
  };

  render() {
    return (
      <div>
        <PageHeader>
          <h1>Users</h1>
        </PageHeader>
        <BootstrapTable data={this.props.all} striped={true} hover={true} condensed={true} pagination={true} search={true} selectRow={this.selectRowProp} exportCSV={true}>
          <TableHeaderColumn dataField="username" width="100" isKey={true} dataSort={true}>Username</TableHeaderColumn>
          <TableHeaderColumn dataField="firstname" width="100" dataSort={true}>First Name</TableHeaderColumn>
          <TableHeaderColumn dataField="lastname" width="100" dataSort={true}>Last Name</TableHeaderColumn>
          <TableHeaderColumn dataField="email" width="100" dataSort={true}>Email</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_user_id" width="100" dataSort={true} dataFormat={this.getUser}>Slack User ID</TableHeaderColumn>
          <TableHeaderColumn dataField="is_bot" width="50" dataSort={true} dataFormat={this.isBot}>Bot User?</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { all: state.users.all, user: state.users.user };
}

export default connect(mapStateToProps, { fetchUsers, fetchUser })(UsersList);
