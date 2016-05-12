var db = require('./postgres.js');
var request = require('request');

module.exports = {
  getAllChannels: function (req, res) {
    // console.log('hello');
    console.log(db.getTableData('channels'));
    res.end()
  },

  getAllUsers: function () {

  },

  getUserData: function () {

  },

  getChannelMessages: function () {

  }
}