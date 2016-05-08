var github = require('./github');
var helper = require('../config/helper');

github.auth();

exports.repo = function slashRepo(req, res) {
  var list;
  // regex validation empty string, integer or help
  // TO DO - case insensitive help
  var reg = /^(\s*|\d+|help|Help)$/;

  // TO DO - verify token
  var slashToken = req.body.token;

  var slashUrl = req.body.response_url;
  var argument = req.body.text;

  // send an initial response to avoid timeout error
  res.json({
    response_type: 'ephemeral',
    text: 'BeepBop.. Fetching repos.'
  });

  github.api.repos.getAll(
    {
      type: 'all',
      sort: 'updated'
    },
    function responseRepo(err, repos) {
      if (err) res.json(err);

      if (Number(argument)) {
        // round the number if not an integer
        argument = Math.round(argument);
        // only show the number of requested repos
        repos = repos.slice(0, argument);
      }

      if (reg.test(argument)) {
        list = github.repoList(github.repoInfo(repos), argument);
        helper.sendHook(slashUrl, list);
      } else {
        res.json('invalid command, please check /repo help');
      }
    }
  );
};

exports.watch = function slashWatch(req, res) {
  var argument = req.body.text;
  var slashUrl = req.body.response_url;
  var userRepo = argument.split('/');
  var user = userRepo[0];
  var repo = userRepo[1];

  var regWhiteSpace = /^\s*$/;

  // send an initial response to avoid timeout error
  res.json({
    response_type: 'ephemeral',
    text: 'BeepBop.. Targeting repo.'
  });

  // /watch or /watch list
  if (regWhiteSpace.test(argument) || argument === 'list') {
    // get list of watched repo
    // needs to store in database or in file a list of watched repo
  }

  // /watch help
  if (argument.toLowerCase() === 'help') {
    var slackMessage = {
      text: 'How to use /watch',
      attachments: [{
        text: '`/watch` will show you all current watched repositories.\n`/watch <user>/<repo>` will subscribe you to the repository\'s events',
        color: 'good',
        mrkdwn_in: ['text']
      }]
    };
    helper.sendHook(slashUrl, slackMessage);
    return;
  }

  // validation for repo
  if (repo === undefined || repo === '' || repo === ' ') {
    helper.sendHook(slashUrl, {
      text: 'empty value for repo, please read /watch help'
    });
    return;
  }

  var hookData = {
    name: 'web',
    active: true,
    user: user,
    repo: repo,
    events: [
      'commit_comment',
      'create',
      'delete',
      'deployment_status',
      'issues',
      'issue_comment',
      'pull_request',
      'pull_request_review_comment',
      'push',
      'release',
      'fork'
    ],
    config: {
      url: process.env.serverUrl,
      content_type: 'json'
    }
  };


  github.api.repos.createHook(hookData, function resHook(err, data) {
    if (err) {
      err = JSON.parse(err);
      var errorMsg = {
        text: user + '/' + repo + ' ' + err.message
      };

      // send error logs instead if available
      if (err.errors !== undefined) {
        errorMsg.text = 'I am already watching ' + argument;
        // TO DO enable error logging for other types of errors
        // errorMsg = err.errors[0].message;
      }

      helper.sendHook(slashUrl, errorMsg);
    } else {
      if (data.active) {
        var text = {
          text: 'I am now watching ' + req.body.text + '\'s every move'
        };
        helper.sendHook(slashUrl, text);
      }
    }
  });
};

// TO DO - validation
exports.unwatch = function slashUnwatch(req, res) {
  var argument = req.body.text;
  var slashUrl = req.body.response_url;
  var userRepo = argument.split('/');
  var user = userRepo[0];
  var repo = userRepo[1];
  var initialResponse = 'Hmmm..';

  // send an initial response to avoid timeout error
  res.json(initialResponse);

  // unwatch help
  if (argument.toLowerCase() === 'help') {
    var slackMessage = {
      text: 'How to use /unwatch',
      attachments: [{
        text: '`/unwatch <user>/<repo>` will unsubscribe from the repository\'s events',
        color: 'good',
        mrkdwn_in: ['text']
      }]
    };
    helper.sendHook(slashUrl, slackMessage);
    return;
  }

  // get list of hooks
  github.api.repos.getHooks(
    {
      user: user,
      repo: repo
    },
    // find the id of hook associated to the app
    function getHookCb(err, hooks) {
      github.findHookId(err, hooks, function deleteHook(id) {
        // delete hook
        github.api.repos.deleteHook(
          {
            user: user,
            repo: repo,
            id: id
          },
          function deleteHookCb(err, response) {
            if (response.meta.status === '204 No Content') {
              var deleteConfirmation = {
                text: 'Ok! I\'ll stop notifying you of ' + argument + '\'s events'
              };
              helper.sendHook(slashUrl, deleteConfirmation);
            }
          }
        );
      });
    }
  );
};