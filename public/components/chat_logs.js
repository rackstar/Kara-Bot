import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchChannels, fetchChat, fetchUser } from '../actions/index';
import { Link } from 'react-router';
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class ChatLogs extends Component {
  static contextTypes = {
    router: PropTypes.object
  };
  componentWillMount() {
    this.props.fetchChannels();
    this.props.fetchChat();
    if(this.props.userid) {
      this.props.fetchUser(this.props.userid);
    } else {
      this.props.fetchUser();
    }
    this.setState({channel:null, user:null});
  }

  renderChannelDropdown(channel) {
    return (
      <MenuItem key={channel.slack_channel_id} eventKey={channel}>{channel.channel_name}</MenuItem>
    );
  }

  getChat(channel) {
    this.props.fetchChat(channel.slack_channel_id);
    this.setState({channel:channel});
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
        <h1>Chat</h1>
        <div className="dropdown">
          <DropdownButton bsStyle="default" title="Channels" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" onSelect={this.getChat.bind(this)}>
            {this.props.channels.map(this.renderChannelDropdown)}
          </DropdownButton>
        </div>
        <BootstrapTable data={this.props.messages} striped={true} hover={true} condensed={true} pagination={true} search={true} selectRow={this.selectRowProp} exportCSV={true}>
          <TableHeaderColumn dataField="message_id" width="80" isKey={true} dataSort={true}>Message ID</TableHeaderColumn>
          <TableHeaderColumn dataField="username" width="80" dataSort={true}>Username</TableHeaderColumn>
          <TableHeaderColumn dataField="created_at" hidden={true}>Created At</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_user_id" hidden={true}>Slack User ID</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_ts" width="80" dataSort={true}>Timestamp</TableHeaderColumn>
          <TableHeaderColumn dataField="message_text" dataSort={true}>Message</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { channels: state.channels.channels, messages: state.channels.messages, user: state.users.user };
}

export default connect(mapStateToProps, { fetchChannels, fetchChat, fetchUser })(ChatLogs);
