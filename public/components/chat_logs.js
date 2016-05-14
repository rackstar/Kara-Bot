import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchChannels, fetchChat } from '../actions/index';
import { Link } from 'react-router';
import { DropdownButton, MenuItem } from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
// import Messages from './messages';

class ChatLogs extends Component {
  componentWillMount() {
    this.props.fetchChannels();
    this.props.fetchChat();
    this.setState({channel:null});
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

  renderChat(message) {
    return (
      <tr key={message.message_id}>
        <td>{message.channel_id}</td>
        <td>{message.slack_user_id}</td>
        <td>{message.message_text}</td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <h1>Chat</h1>
        <div className="dropdown">
          <DropdownButton bsStyle="default" title="Channels" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" onSelect={this.getChat.bind(this)}>
            {this.props.channels.map(this.renderChannelDropdown)}
          </DropdownButton>
        </div>
        <BootstrapTable data={this.props.messages} striped={true} hover={true} condensed={true} pagination={true} search={true}>
          <TableHeaderColumn dataField="message_id" isKey={true} dataSort={true}>Message ID</TableHeaderColumn>
          <TableHeaderColumn dataField="created_at" dataSort={true}>Created At</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_user_id" dataSort={true}>Slack User ID</TableHeaderColumn>
          <TableHeaderColumn dataField="slack_ts" dataSort={true}>Timestamp</TableHeaderColumn>
          <TableHeaderColumn dataField="message_text" dataSort={true}>Message</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { channels: state.channels.channels, messages: state.channels.messages };
}

export default connect(mapStateToProps, { fetchChannels, fetchChat })(ChatLogs);


// render() {
//     return (
//       <div>
//         <h1>Chat</h1>
//         <div className="dropdown">
//           <DropdownButton bsStyle="default" title="Channels" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" onSelect={this.getChat.bind(this)}>
//             {this.props.channels.map(this.renderChannelDropdown)}
//           </DropdownButton>
//         </div>
//         <Table responsive striped bordered condensed hover>
//           <thead>
//             <tr>
//               <th data-field="channel_id" data-sortable="true">Channel</th>
//               <th data-field="slack_user_id" data-sortable="true">User</th>
//               <th data-field="message_text" data-sortable="true">Message</th>
//             </tr>
//           </thead>
//           <tbody>
//             {this.props.messages.map(this.renderChat)}
//           </tbody>
//         </Table>
//       </div>
//     );
//   }
