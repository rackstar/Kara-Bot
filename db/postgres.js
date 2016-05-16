var request = require('request');
var pg = require('pg');

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/karabot';


require('dotenv').config();

var token = process.env.token;

var userListForm = {
  url: 'https://slack.com/api/users.list',
  form: {
    token: token
  }
};

var channelListForm = {
  url: 'https://slack.com/api/channels.list',
  form: {
    token: token
  }
};

function dbInsert(table, columns, values, valuesHolder) {
  // values = [val1, val2, val3];
  // columns = '(col1, col2, col3)'
  // valuesHolder = 'values($1, $2, $3)'
  // get connection string from database import
  pg.connect(connectionString, function pgInsert(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    // SQL Query > Insert Data
    // "INSERT INTO items(text, complete) values($1, $2), [val1, val2]"
    var query = client.query('INSERT INTO ' + table + columns + ' ' + valuesHolder, values);
    query.on('end', function dbInsertEnd() {
      done();
    });
  });
}

function slackRequest(form, cb) {
  request.post(form, function requestCb(err, response, body) {
    if (err) {
      console.log(err);
    }
    body = JSON.parse(body);
    cb(body);
  });
}

function getCurrentData(cb, newData, table, property) {
  var currentData = [];
  // Get a Postgres client from the connection pool
  // get connectionString from imported connection pg.connectionString
  pg.connect(connectionString, function pgSelect(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM " + table);

    // Stream results back one row at a time
    query.on('row', function currentDataRow(row) {
      if (property) {
        row = row[property];
      }
      // push data to channels
      currentData.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function currentDataEnd() {
      done();
      // callback on channels
      cb(currentData, newData);
    });
  });
}

function addChannel(channel) {
  var columns = '(channel_name, slack_channel_id)';
  var values = [channel.name, channel.id];
  var valuesHolder = 'values($1, $2)';
  // add Channel
  dbInsert('channels', columns, values, valuesHolder);
}

function channelMembers(channel) {
  var membersId = channel.members;
  membersId.forEach(function insertMember(memberId) {
    var columns = '(slack_user_id, channel_id)';
    var values = [memberId, channel.id];
    var valuesHolder = 'values($1, $2)';
    // create relationship
    dbInsert('channel_user', columns, values, valuesHolder);
  });
}

function checkNewChannel(currentChannels, newChannels) {
  // check if old and new channel length is the same
  if (newChannels.length > currentChannels.length) {
    newChannels.forEach(function checkChannelExists(channel) {
      // find the new channel
      if (currentChannels.indexOf(channel.id) < 0) {
        addChannel(channel);
        channelMembers(channel);
      }
    });
  }
}

function addUser(user) {
  var columns = '(username, slack_user_id, firstname, lastname, is_bot)';
  var values = [user.name, user.id, user.profile.first_name, user.profile.last_name, user.is_bot];
  var valuesHolder = 'values($1, $2, $3, $4, $5)';
  // add email if not bot
  if (user.is_bot === false && user.profile.email) {
    values.push(user.profile.email);
    valuesHolder = 'values($1, $2, $3, $4, $5, $6)';
    columns = '(username, slack_user_id, firstname, lastname, is_bot, email)';
  }
  // add to users table
  dbInsert('users', columns, values, valuesHolder);
}

function checkNewUsers(currentUsers, newUsers) {
  if (newUsers.length > currentUsers.length) {
    newUsers.forEach(function checkUserExists(user) {
      if (currentUsers.indexOf(user.id) < 0) {
        addUser(user);
      }
    });
  }
}

function channelHistory(channelId, ts) {
  var channelMsgForm = {
    url: 'https://slack.com/api/channels.history',
    form: {
      token: token,
      channel: channelId,
      oldest: ts || 0,
      count: 1000
    }
  };
  slackRequest(channelMsgForm, function channelMsgCb(body) {
    var messages = body.messages;
    // connect to db
    var userClient = new pg.Client(connectionString);
    userClient.connect();
    // query user db to build reference between slack_user_id and username
    var usernames = {};
    var userQuery = userClient.query('SELECT * FROM users');
    userQuery.on('row', function userQueryRow(user) {
      usernames[user.slack_user_id] = user.username;
    });

    userQuery.on('end', function userQueryEnd() {
      userClient.end();

      messages.forEach(function insertMsgs(message) {
        message.username = usernames[message.user] || 'no_name_webhook';
        message.user = message.user || 'no_id_webhook';
        var columns = '(message_text, slack_ts, slack_user_id, channel_id, username)';
        var values = [message.text, message.ts, message.user, channelId, message.username];
        var valuesHolder = 'values($1, $2, $3, $4, $5)';
        // insert message text, ts, and slack_user_id to Message table
        dbInsert('messages', columns, values, valuesHolder);
      });
    });
  });
}

function channelMsgs(currentChannels) {
  // forEach channel, find oldest ts message
  currentChannels.forEach(function findOldestTs(channelId) {
    var currentTS = [];
    pg.connect(connectionString, function pgSelect(err, client, done) {
      // Handle connection errors
      if (err) {
        done();
        console.log(err);
      }

      // Get all messages for each channel ordered by descending timestamp
      var query = client.query("SELECT * FROM messages " +
                               "WHERE channel_id = " + "'" + channelId.toUpperCase() + "' " +
                               "ORDER BY slack_ts DESC");

      query.on('row', function channelMsgRow(row) {
        currentTS.push(row.slack_ts);
      });

      query.on('end', function channelMsgEnd() {
        done();
        // grab the latest timestamp and query slack starting from that message to any new ones
        var latestTS = currentTS[0];
        if (latestTS) {
          channelHistory(channelId, latestTS);
        } else {
          // if no previous messages - get all
          channelHistory(channelId);
        }
      });
    });
  });
}

function getTableData(cb, table) {
  var currentData = [];
  // Get a Postgres client from the connection pool
  // get connectionString from imported connection pg.connectionString
  pg.connect(connectionString, function pgSelect(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM " + table);

    // Stream results back one row at a time
    query.on('row', function tableDataRow(row) {
      //push data to channels
      currentData.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function tableDataEnd() {
      done();
      // return table data
      cb(currentData);
    });
  });
  // return currentData
}

function select(cb, table, column, value, property) {
  var data = [];

  pg.connect(connectionString, function pgSelect(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    // "SELECT * FROM table WHERE column = 'value'"
    var query = client.query("SELECT * FROM " + table +
      " WHERE " + column + "='" + value + "'");

    query.on('row', function selectRow(row) {
      if (property) {
        row = row[property];
      }
      data.push(row);
    });

    query.on('end', function selectEnd() {
      done();
      // callback on data
      cb(data);
    });
  });
}

function populateDB() {
  // Channel Query
  slackRequest(channelListForm, function channelListCb(body) {
    // check for any new channels
    var newChannels = body.channels;
    // compare for any diff on channels in the database
    getCurrentData(checkNewChannel, newChannels, 'channels', 'slack_user_id');
  });

  // User Query
  slackRequest(userListForm, function userListCb(body) {
    // check for any new users
    var newUsers = body.members;
    // compare for any diff on channels in the database
    getCurrentData(checkNewUsers, newUsers, 'users', 'slack_user_id');
  });

  // Message Query
  // make sure other query finishes before initiliasing
  setTimeout(function msgQueryTimeout() {
    getCurrentData(channelMsgs, null, 'channels', 'slack_channel_id');
  }, 1500);
}

function msgsAfterTs(cb, column, columnValue, startTs, endTs) {
  var data = [];
  var command;
  pg.connect(connectionString, function pgSelect(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    command = "SELECT * from messages " +
              "WHERE " + column + " = " + "'" + columnValue + "'" +
              "AND slack_ts >= " + "'" + startTs + "' " +
              "AND slack_ts <= " + "'" + endTs + "' " +
              "ORDER BY slack_ts ASC";

    var query = client.query(command);

    query.on('row', function msgsAfterTsRow(row) {
      var msgDate = {
        message: row.message_text,
        date: new Date(row.slack_ts * 1000)
      };
      data.push(msgDate);
    });

    query.on('end', function msgAfterTsEnd() {
      done();
      // callback on data
      cb(data);
    });
  });
}

module.exports = {
  channelListForm: channelListForm,
  slackRequest: slackRequest,
  getTableData: getTableData,
  select: select,
  populateDB: populateDB,
  msgsAfterTs: msgsAfterTs
};