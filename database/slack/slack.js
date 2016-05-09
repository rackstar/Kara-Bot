var request = require('request');
// require the connected postgres client
var client = require('');
var _ = require('lodash');

require('dotenv')
  .config();

var token = process.env.token;

// var userListForm = {
//   url: 'https://slack.com/api/users.list',
//   form: {
//     token: token
//   }
// };

function dbInsert (table, columns values) {
  // values = '(val1, val2, val3)'
  // columns = '(col1, col2, col3)'
  // get connection string from database import
  pg.connect(connectionString, function(err, client, done) {
          // Handle connection errors
          if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
          }

          // SQL Query > Insert Data
          client.query("INSERT INTO " + table + columns + ' values' + values, [ /* what is this for? data.text, data.complete*/]);

          // After all data is returned, close connection
          query.on('end', function() {
              done();
          });
      });
}

var channelListForm = {
  url: 'https://slack.com/api/channels.list',
  form: {
    token: token
  }
};

function slackRequest(form, cb) {
  request.post(form, function(err, response, body) {
    if (err) console.log(err);
    body = JSON.parse(body);
    cb(body);
  });
}
// get all channel
slackRequest(channelListForm, function(body) {
  // check for any new channel
  checkNewChannel(body);
});

function checkNewChannel(body, cb1, cb2) {
  var channels = body.channels;
  // Query database of all current channels
  var currentChannel =

  if (channels.length > currentChannel.length) {
    channels.forEach(function(channel) {
      // find the new channel
      if (currentChannels.indexOf(channel.id) < 0) {
        console.log(channel.name, channel.id, 'NEW CHANNEL');
        // addChannel
        // cb1(channel)
        // channelMembers - create relationship
        // cb2(channel)
      }
    });
  }
}

function addChannel (channel) {
  var name = channel.name;
  var id = channel.id;
  // add Channel
}

function channelMembers (channel) {
  var membersId = channel.members;
  membersId.forEach(function(memberId) {
    // create relationship
    var channelId = channel.id;
    memberId
  });
}

function channelHistory (channelId, ts) {
  var channelMsgForm = {
    url: 'https://slack.com/api/channels.history',
    form: {
      channel: channelId,
      oldest: ts || 0, //"ts": "1462822242.000002" // unique timestamp for each message in channel
      // newer messages have higher ts value than older ones
      count: 1000
    }
  };
  slackRequest(channelMsgForm, function(body) {
    var messages = body.messages;

    messages.forEach(function(message) {
      // change relationship of message to be with slack_id because its easier
      var columns = '(message_body, ts, slack_user_id)'
      var values = '(' + message.text + ', ' + message.ts + ', ' + message.user + ')';
      // insert message text, ts, and slack_user_id to Message table
      dbInsert('Messages', columns, values);
    })
  })
}

// Query database for all channels id.
// for each channel, find oldest ts message (lowest ts)
// use it as the starting query for channelHistory
// channelHistory(id, ts)

function getChannels (cb) {
  var channels = [];
  // Get a Postgres client from the connection pool
  // get connectionString from imported connection pg.connectionString
     pg.connect(connectionString, function(err, client, done) {
         // Handle connection errors
         if(err) {
           done();
           console.log(err);
           return res.status(500).json({ success: false, data: err});
         }

         // SQL Query > Select Data
         var query = client.query("SELECT * FROM Channels");

         // Stream results back one row at a time
         query.on('row', function(row) {
            //push data to channels
             channels.push(row);
         });

         // After all data is returned, close connection and return results
         query.on('end', function() {
             done();
             // callback on channels
             cb(channels)
         });
     });
}

function lowestTS (channels, cb) {
  // get minimum ts of each channel
  // convert ts string to number
  var lowestTS = _.minBy(channels, function(channel) {
    //channel.ts
  });
  // call channelHistory on each of channelId and lowestTS
  channelHistory(channelId, lowestTS)
}

// function checkNewUsers(body, oldCount, cb) {
//   var members = body.members;
//   console.log(members.length);
//   if (members.length > oldCount) {
//     members.forEach(function(member) {
//       var slackId = member.id;
//       // check using slackId if user is already in database
//       var username = member.name;
//       var firstname = member.profile.first_name;
//       var lastname = member.profile.last_name;
//       var is_bot = member.is_bot;
//       if (!is_bot) {
//         var email = member.profile.email;
//       }
//       // addUser
//       cb();
//     });
//   }

// }

// function addUser (details) {
//   // create new entry
// }


// slackRequest(userListForm, checkNewUsers);
