import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/index';
import { Link } from 'react-router';
import { PageHeader } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class User extends Component {
  componentWillMount() {
    this.props.fetchUser();
    this.setState({ready:false});
  }
  componentDidMount() {
    var id = this.props.params.id;
    var currContext=this;
    this.props.fetchUser(id)
      .then(()=> {
        currContext.buildData(currContext.makeReady.bind(currContext));
      });
  }
  allChannels={};
  userInfo={};

  buildData(callback) {
    this.userInfo = this.props.user[this.props.user.length-2][0];
    var channels = this.props.user[this.props.user.length-1];

    for(var i = 0; i < channels.length; i++) {
      this.allChannels[channels[i].slack_channel_id] = channels[i].channel_name;
    }
    callback();
  }
  makeReady() {
    this.setState({ready:true});
  }

  channelName(cell, row) {
    return this.allChannels[cell];
  }

  render() {
    if(this.state.ready) {
      return (
        <div>
          <PageHeader>
            <h1>User: {this.userInfo.username}</h1>
          </PageHeader>
          <h5>First Name: {this.userInfo.firstname}</h5>
          <h5>Last Name: {this.userInfo.lastname}</h5>
          <h5>Email: {this.userInfo.email}</h5>
          <h5>Bot User: {this.userInfo.is_bot.toString().toUpperCase()}</h5>
          <BootstrapTable data={this.props.user} striped={true} hover={true} condensed={true} pagination={true} search={true} exportCSV={true}>
            <TableHeaderColumn dataField="message_id" width="50" isKey={true} dataSort={true}>ID</TableHeaderColumn>
            <TableHeaderColumn dataField="channel_id" width="100" dataSort={true} dataFormat={this.channelName.bind(this)}>Channel</TableHeaderColumn>
            <TableHeaderColumn dataField="slack_ts" width="100" dataSort={true}>Timestamp</TableHeaderColumn>
            <TableHeaderColumn dataField="message_text" dataSort={true}>Message</TableHeaderColumn>
          </BootstrapTable>
        </div>
      );
    } else {
      return(<h1>Loading...</h1>);
    }
  }
}

function mapStateToProps(state) {
  return { user: state.users.user };
}

export default connect(mapStateToProps, { fetchUser })(User);
