var path = require('path');
var kara = require('../karabot');
var github = require('../github/github');
var slashCommands = require('../github/githubSlashCommands');
var jiraController = require('../../server/jira/jiraController');
var dbController = require('../../db/postgres-controller');
var tone = require('../../db/watson/tone');
var slackAuth = require('../oauth/slackAuth');
var githubAuth = require('../oauth/githubAuth');

function errorLogger(error, req, res, next) {
  // log the error then send it to the next middleware
  console.error(error.stack);
  next(error);
}

function errorHandler(error, req, res, next) {
  // send error message to client
  // message for gracefull error handling on app
  res.status(500).send({ error: error.message });
}

// frontend routes =========================================================
module.exports = function routes(app) {
  // Github
  app.post('/github', github.webHookReceiver);
  app.post('/repo', slashCommands.repo);
  app.post('/watch', slashCommands.watch);
  app.post('/unwatch', slashCommands.unwatch);

  // receive incoming POST requests from JIRA webhooks
  // TO DO - change to '/jira'?
  app.post('/', jiraController.handleJiraWebhooksIssues);

  // get highest priority JIRA issues on request
  app.get('/getHighestPriorityIssues', jiraController.getHighestPriorityIssues);

  // database queries
  // list channels
  app.get('/api/channel', dbController.getAllChannels);
  // Get channel messages - date range, last 30 days,
  app.post('/api/channel/:channel_id', dbController.getChannelMessages);
  // List users - get
  app.get('/api/user', dbController.getAllUsers);
  // Get user data - get
  app.get('/api/user/:user_id', dbController.getUserData);

  // Watson
  app.post('/api/watson/user', tone.user);
  app.post('/api/watson/channel', tone.channel);

  // Slack Oauth
  app.get('/auth', function(req, res){
    slackAuth(req, res);
    res.sendFile(path.resolve(__dirname, '../../public', 'auth.html'))
  });

  app.get('/auth/github', githubAuth)

  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../../public', 'index.html'));
  });

  // Error Logger/Handler
  app.use(errorLogger);
  app.use(errorHandler);
};
