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
  unirest.get('http://localhost:5000/getHighestPriorityIssues', function (res) {
    console.log('RESPONSE', res.body)
    if(res.body.length > 0){
      res.body.forEach(function (issue) {
        issueMessages.push('*' + issue.key + '*\n*Description*: ' + issue.description + '\n');
      });
      var botMessage = '*' + issueMessages.length + '* highest prioriy issue(s):\n\n' + issueMessages.join('--------------\n');
      bot.reply(message, botMessage);
    };
  });
}

// function checkForHighestPriorityIssues (bot, message) {
//   var issueMessages = [];
//   unirest.get('http://localhost:5000/checkForHighestPriorityIssues', function (res) {
//     if(res.body.length > 0){
//       res.body.forEach(function (issue) {
//         issueMessages.push('*' + issue.key + '*\n*Description*: ' + issue.fields.description + '\n');
//       });
//       var botMessage = '*' + issueMessages.length + '* NEW highest prioriy issue(s):\n\n' + issueMessages.join('--------------\n');
//       bot.reply(message, botMessage);
//     };
//   });
// }
