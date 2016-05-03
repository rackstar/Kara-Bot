var Botkit = require('botkit');
var chat = require('./basic_convo/chat.js');
var egg = require('./basic_convo/egg.js');
var jira = require('./jira/jira.js')

var controller = Botkit.slackbot({
  debug: true
});

exports.controller = controller;

require('dotenv').config();

controller.spawn({
  token: process.env.token
}).startRTM();

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}


// Listening routes
controller.hears(['hello'], 'direct_message,direct_mention,mention', chat.greet);
controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention',
  chat.myname);
controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention',
  chat.sayname);
controller.hears(['shutdown'], 'direct_message,direct_mention,mention', chat.shutdown);
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', chat.uptime);
controller.hears(['life, the universe and everything', 'life the universe and everything'],
  'direct_message,direct_mention,mention', egg.hitch);
controller.hears(['master code', 'konami code'], 'direct_message,direct_mention,mention',
  egg.konami);
  controller.hears(['life, the universe and everything', 'life the universe and everything'], 'direct_message,direct_mention,mention', egg.hitch);
  controller.hears(['master code', 'konami code'], 'direct_message,direct_mention,mention', egg.konami);

  //Get highest priority issues

  controller.hears(['jira priority 1', 'jira priority one', 'jira highest priority', 'highest priority jira'], 'direct_message,direct_mention,mention', jira.getHighestPriorityIssues);
