var Botkit = require('botkit');
var chat = require('./basic_convo/chat.js');
var egg = require('./basic_convo/egg.js');
var jira = require('./jira/jira.js');
var calendar = require('./basic_convo/calendar.js');
var github = require('./github/github.js');

var directMessage = 'direct_message,direct_mention,mention';

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
controller.hears(['hello'], directMessage, chat.greet);
controller.hears(['call me (.*)', 'my name is (.*)'], directMessage, chat.myname);
controller.hears(['what is my name', 'who am i'], directMessage, chat.sayname);
controller.hears(['shutdown'], directMessage, chat.shutdown);
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], directMessage,
  chat.uptime);
controller.hears(['life, the universe and everything', 'life the universe and everything'],
  directMessage, egg.hitch);
controller.hears(['master code', 'konami code'], directMessage, egg.konami);

// Get highest priority issues
controller.hears(['jira priority 1', 'jira priority one', 'jira highest priority', 'highest priority jira'], directMessage, jira.getHighestPriorityIssues);

// Google Calendar
controller.hears(['clist'], directMessage, calendar.clist);
controller.hears(['ctoday'], directMessage, calendar.ctoday);
controller.hears(['ctomo*', 'ctomm*'], directMessage, calendar.ctomo);
controller.hears(['ctest'], 'direct_message,direct_mention,mention', calendar.ctest);
controller.hears(['cdayaft'], 'direct_message,direct_mention,mention', calendar.cdayaft);
controller.hears(['cfree'], 'direct_message,direct_mention,mention', calendar.cfree);

// Github
controller.hears(['show (.*) repos', 'show (.*) repo', 'repo (.*)', 'repos (.*)',
  'show repos', 'repos', 'show repo'], directMessage, github.getRepo);
controller.hears(['unwatch (.*\/.*)'], directMessage, github.unwatchRepo);
controller.hears(['watch (.*\/.*)'], directMessage, github.watchRepo);
