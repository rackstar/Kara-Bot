import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchChat } from '../actions/index';
import { Link } from 'react-router';

export default class BotActivity extends Component {
  // componentWillMount() {
  //   this.props.fetchChat();
  // }

  // renderChat() {
  //   return this.props.messages.map((message) => {
  //     return (
  //       <li className="list-group-item" key={message.id}>
  //         List Item!
  //       </li>
  //     );
  //   });
  // }

  render() {
    return (
      <div>
        <h3>Bot Activity</h3>
        <ul>
          <li>Data to be displayed later</li>
          <li>Data to be displayed later</li>
          <li>Data to be displayed later</li>
        </ul>
      </div>
    );
  }
}

// function mapStateToProps(state) {
//   return { messages: state.posts.all };
// }

// export default connect(mapStateToProps, { fetchChat })(BotActivity);