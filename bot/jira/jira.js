var Botkit = require('botkit');
var unirest = require('unirest');

var controller = Botkit.slackbot({
  debug: true
});

module.exports = {
  getHighestPriorityIssues: getHighestPriorityIssues
};

function getHighestPriorityIssues(bot, message) {
  var issueMessages = [];
  unirest.get('http://karabot-eng.herokuapp.com/getHighestPriorityIssues', function (res) {

    // error handler
    if (res.body.error) {
      bot.reply(message, 'I\'m sorry I cannot process your request right now :confused:');
    } else if (res.body.length > 0) {
      res.body.forEach(function (issue) {
        issueMessages.push('*' + issue.title + '*\n*Description*: ' +
          issue.summary + '\n' +
          issue.assignee + '\n' +
          issue.issueLink + '\n');
      });
      var botMessage = '*' + issueMessages.length +
        '* highest prioriy issue(s):\n\n' + issueMessages.join('--------------\n');
      bot.reply(message, botMessage);
    };
  });
}
