var Botkit = require('botkit');
var chat = require('./basic_convo/chat');
var egg = require('./basic_convo/egg');
var jira = require('./jira/jira');
var calendar = require('./basic_convo/calendar');
var github = require('./github/github');
var weather = require('./weather/weather')
var translate = require('./watson/translation');
var tone = require('./watson/tone');

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

// Translation
controller.hears(['translate -([A-z]{2}) (.*)'], directMessage, translate);

// Commands
controller.hears(['hello'], directMessage, chat.greet);
controller.hears(['call me (.*)', 'my name is (.*)'], directMessage, chat.myname);
controller.hears(['what is my name', 'who am i'], directMessage, chat.sayname);
controller.hears(['shutdown'], directMessage, chat.shutdown);
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], directMessage,
  chat.uptime);
controller.hears(['life, the universe and everything', 'life the universe and everything'],
  directMessage, egg.hitch);
controller.hears(['master code', 'konami code'], directMessage, egg.konami);

// Jira
controller.hears(['jira priority 1', 'jira priority one', 'jira highest priority', 'highest priority jira'], directMessage, jira.getHighestPriorityIssues);

// Google Calendar
controller.hears(['clist'], directMessage, calendar.clist);
controller.hears(['ctoday'], directMessage, calendar.ctoday);
controller.hears(['ctomo*', 'ctomm*'], directMessage, calendar.ctomo);
controller.hears(['cdayaft'], directMessage, calendar.cdayaft);
controller.hears(['cfreetom'], directMessage, calendar.cfreetom); // ensure botkit traps this before 'cfree'
controller.hears(['cfree'], directMessage, calendar.cfree);
controller.hears(['cnew'], directMessage, calendar.cnew);
controller.hears(['chelp'], directMessage, calendar.chelp);

// Github
controller.hears(['show (.*) repos', 'show (.*) repo', 'repo (.*)', 'repos (.*)',
  'show repos', 'repos', 'show repo'], directMessage, github.getRepo);
controller.hears(['unwatch (.*)'], directMessage, github.unwatchRepo);
controller.hears(['watch (.*)'], directMessage, github.watchRepo);
controller.hears(['github help'], directMessage, github.help);

// Tone
controller.hears(['tone list', 'tone (channels?)'], directMessage, tone.channelList);
controller.hears(['tone ((?!help).*)'], directMessage, tone.toneChannel);
controller.hears(['tone', 'tone help'], directMessage, tone.help);

// Weather
controller.hears(['weather today in (.*)', 'weather today for (.*)', 'weather today (.*)'], directMessage, weather.getTodayWeather);
controller.hears(['weather tomorrow in (.*)', 'weather tomorrow for (.*)', 'weather tomorrow (.*)'], directMessage, weather.getTomorrowWeather);
controller.hears(['4 day in (.*)', '4 day for (.*)'], directMessage, weather.getFourDayForecast);
