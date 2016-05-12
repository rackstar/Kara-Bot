var db = require('./postgres.js');
var request = require('request');

module.exports = {
  getAllChannels: function (req, res) {
    var channels; 
    //get channel data and assign it to channels variable
    db.getTableData(function(data){ 
        channels = data;
    }, 'channels');
    //wait for db query to finish
    setTimeout(function(){
      console.log(channels);
      res.send(channels);
    }, 100)
  },

  getAllUsers: function (req, res) {
    var users; 
    //get all users and assign to userss variable
    db.getTableData(function(data){ 
        users = data;
    }, 'users');
    //wait for db query to finish
    setTimeout(function(){
      console.log(users);
      res.send(users);
    }, 100)
  },

  getUserData: function (req, res) {
    
  },

  getChannelMessages: function () {

  }
}