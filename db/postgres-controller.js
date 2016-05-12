var db = require('./postgres.js');
var request = require('request');

module.exports = {
  getAllChannels: function (req, res) {
    var channels; 
    //get channel data and assign it to channels variable
    db.getTableData(function(data){ 
        channels = data;
        res.send(channels);
    }, 'channels');
  },

  getAllUsers: function (req, res) {
    var users; 
    //get all users and assign to userss variable
    db.getTableData(function(data){ 
        users = data;
        res.send(users);
    }, 'users');
  },

  getUserData: function (req, res) {
    // split url to get user slack id
    var splitUrl = req.url.split('/');
    var user = splitUrl[splitUrl.length-1];
    var userData;
    //get corresponding user from the db
    db.select(function (data) {
      userData = data;
      db.select(function (messages) {
        userData.push(messages);
        res.send(userData);
      }, 'users', 'slack_user_id', user);
    }, 'messages', 'slack_user_id', user);
  },

  getChannelMessages: function (req, res) {
    // split url to get channel slack id
    var splitUrl = req.url.split('/');
    var channel = splitUrl[splitUrl.length-1];
    var channelMessages = [];
    //variables for how far back we should look for messages (default is 7 days)
    var days;
    req.body.days ? days = parseInt(req.body.days) : days = 7;
    var range = Date.now() - (days * 24 * 60 * 60 * 1000);
    var time = new Date();
    //query the database for messages
    db.select(function (data) {
      var allMessages = data;
      //get messages added to the database within the range
      allMessages.forEach(function(row){
        var createdAt = time.setTime(row.created_at);
        if(createdAt > range){
          channelMessages.push(row);
        }
      })
      res.send(channelMessages);
    }, 'messages', 'channel_id', channel);
  }
}