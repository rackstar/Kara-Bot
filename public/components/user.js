import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/index';
import { Link } from 'react-router';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class User extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }
  componentDidMount() {
    var id = this.props.params.id;
    this.props.fetchUser(id);
  }

  render() {
    return (
      <div>
        <h1>User: {this.props.user[0].username}</h1>
        <BootstrapTable data={this.props.user} striped={true} hover={true} condensed={true} pagination={true} search={true}>
          <TableHeaderColumn dataField="message_id" isKey={true} dataSort={true}>Message ID</TableHeaderColumn>
          <TableHeaderColumn dataField="channel_id" dataSort={true}>Channel ID</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_ts" dataSort={true}>Timestamp</TableHeaderColumn>
          <TableHeaderColumn dataField="message_text" dataSort={true}>Message</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.users.user };
}

export default connect(mapStateToProps, { fetchUser })(User);
