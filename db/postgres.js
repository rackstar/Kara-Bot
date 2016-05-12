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
    query.on('end', function() {
      done();
    });

  });
}

function slackRequest(form, cb) {
  request.post(form, function(err, response, body) {
    if (err) console.log(err);
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
    query.on('row', function(row) {
      //push data to channels
      row = row || row[property];
      currentData.push(row[property]);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      // callback on channels
      cb(currentData, newData);
    });
  });
}

function checkNewChannel(currentChannels, newChannels) {
  //check if old and new channel length is the same
  if (newChannels.length > currentChannels.length) {
    newChannels.forEach(function(channel) {
      // find the new channel
      if (currentChannels.indexOf(channel.id) < 0) {
        addChannel(channel);
        channelMembers(channel);
      }
    });
  }
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
  membersId.forEach(function(memberId) {
    var columns = '(slack_user_id, channel_id)';
    var values = [memberId, channel.id];
    var valuesHolder = 'values($1, $2)';
    // create relationship
    dbInsert('channel_user', columns, values, valuesHolder);
  });
}

function checkNewUsers(currentUsers, newUsers) {
  if (newUsers.length > currentUsers.length) {
    newUsers.forEach(function(user) {
      if (currentUsers.indexOf(user.id) < 0) {
        addUser(user);
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

function channelHistory(channelId, ts) {
  var channelMsgForm = {
    url: 'https://slack.com/api/channels.history',
    form: {
      token: token,
      channel: channelId,
      oldest: ts || 0, //"ts": "1462822242.000002" // unique timestamp for each message in channel
      // newer messages have higher ts value than older ones
      count: 1000
    }
  };
  slackRequest(channelMsgForm, function(body) {
    var messages = body.messages;

    messages.forEach(function(message) {
      var columns = '(message_text, slack_ts, slack_user_id, channel_id)';
      var values = [message.text, message.ts, message.user, channelId];
      var valuesHolder = 'values($1, $2, $3, $4)';
      // insert message text, ts, and slack_user_id to Message table
      dbInsert('messages', columns, values, valuesHolder);
    });
  });
}

function channelMsgs(currentChannels) {
  // forEach channel, find oldest ts message
  currentChannels.forEach(function(channelId) {
    var currentTS = [];
    pg.connect(connectionString, function pgSelect(err, client, done) {
      // Handle connection errors
      if (err) {
        done();
        console.log(err);
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM messages WHERE channel_id = " + "'" + channelId.toUpperCase() + "'" + " ORDER BY slack_ts DESC");
      //"ORDER BY DESC" - then get first element of each rom

      // Stream results back one row at a time
      query.on('row', function(row) {
        currentTS.push(row['slack_ts']);
      });

      query.on('end', function() {
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

exports.getTableData = function getTableData(cb, table) {
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
    query.on('row', function(row) {
      //push data to channels
      currentData.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      // return table data
      cb(currentData);
    });
  });
  // return currentData
}

exports.populateDB = function populateDB() {
    // Channel Query
    slackRequest(channelListForm, function(body) {
      // check for any new channels
      var newChannels = body.channels;
      // get current database channels
      getCurrentData(checkNewChannel, newChannels, 'channels', 'slack_user_id');
    });

    // User Query
    slackRequest(userListForm, function(body) {
      // check for any new users
      var newUsers = body.members;
      // get current users in database
      getCurrentData(checkNewUsers, newUsers, 'users', 'slack_user_id');
    });

    // Message Query
    // make sure other query finishes before initiliasing
    setTimeout(function() {
      getCurrentData(channelMsgs, null, 'channels', 'slack_channel_id');
    }, 1500);
};
