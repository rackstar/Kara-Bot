var db = require('./postgres.js');
var request = require('request');

module.exports = {
  getAllChannels: function (req, res) {
    console.log('hello');
    res.end()
    // console.log(db.getTableData('channels'));
  },

  getAllUsers: function () {

  },

  getUserData: function () {

  },

  getChannelMessages: function () {

  }
}