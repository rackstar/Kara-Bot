var Botkit = require('botkit');
var unirest = require('unirest');

var controller = Botkit.slackbot({
  debug: true,
});

module.exports = {
  getHighestPriorityIssues: getHighestPriorityIssues
};

function getHighestPriorityIssues(bot, message) {
  var issueMessages = [];
  unirest.get('http://localhost:3000/getHighestPriorityIssues', function(res) {
    res.body.forEach(function(issue) {
      issueMessages.push('*'+issue.key+'*\n*Description*: '+issue.fields.description+'\n')
    });
    var botMessage = '*'+issueMessages.length+'* highest prioriy issue(s):\n\n'+issueMessages.join('--------------\n');
    console.log(botMessage);
    bot.reply(message, botMessage)
  });
}