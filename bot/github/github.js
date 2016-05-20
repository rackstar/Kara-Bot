var GitHubApi = require('github');
var helper = require('../config/helper');

var github = new GitHubApi({
  version: '3.0.0',
  debug: true,
  protocol: 'https',
  host: 'api.github.com',
  timeout: 5000,
  headers: {
    'user-agent': 'Kara-Bot'
  }
});

require('dotenv').load();

// Authentication
function githubAuth() {
  github.authenticate({
    type: 'basic',
    username: process.env.username,
    password: process.env.password
  });
};

// formats each repo info, utilised by getRepo
function repoInfo(repos) {
  var info = [];

  repos.forEach(function repoMsg(repo, i) {
    var repoLinked = helper.hyperLink(repo.full_name, repo.html_url);
    info.push(i + 1 + '  ' + repoLinked + '\n');
  });
  return info.join('');
};

// formats repo message, utilised by getRepo
function repoList(repoInfo, argument) {
  var slackMessage = {
    text: 'Here are your ' + argument + ' most recent repositories:',
    attachments: [{
      text: repoInfo,
      color: 'good',
      mrkdwn_in: ['text']
    }]
  };

  // if argument no argument show all repos
  if (!argument) {
    slackMessage.text = 'Here are all your current repositories:';
  }

  if (argument === 1) {
    slackMessage.text = 'Here is your most recent repository:';
  }
  // HELP
  // if (argument.toLowerCase() === 'help') {
  //   slackMessage.text = 'How to use show repo';
  //   // TO DO - change to show repos
  //   slackMessage.attachments[0].text = '`/repo` will show you all your current repositories.\n`/repo <number>` will show you `<number>` of your most recent repositories';
  // }
  return slackMessage;
}

// Repo
function getRepo(bot, message) {
  var numberOfRepos = message.match[1];
  var list;

  bot.reply(message, 'BeepBop.. Fetching repos.');

  github.repos.getAll(
    {
      type: 'all',
      sort: 'updated'
    },
    function responseRepo(err, repos) {
      if (err) {
        console.log(err);
        bot.reply(message, 'I\'m sorry I cannot process your request right now :confused:');
      }
      // process only the number of repos required
      if (numberOfRepos) {
        numberOfRepos = Math.round(Number(numberOfRepos));
        repos = repos.slice(0, numberOfRepos);
      }

      list = repoList(repoInfo(repos), numberOfRepos);
      bot.reply(message, list);
    }
  );
};

// watch
function watchRepo(bot, message) {
  var watchArg = message.match[1];
  var userRepo;

  github.repos.getAll(
    {
      type: 'all',
      sort: 'updated'
    },
    function responseRepo(err, repos) {
      if (err) {
        bot.reply(message, 'I\'m sorry, I cannot process your request right now :confused:');
        return;
      }

      repos.forEach(function repoMsg(repo, i) {
        if ((i + 1) === Number(watchArg) || watchArg === repo.full_name) {
          userRepo = repo.full_name.split('/');
        }
      });

      if (!userRepo) {
        bot.reply(message, 'I\'m sorry, I can\'t find that repository at this time :confused:');
        return;
      }

      var user = userRepo[0];
      var repo = userRepo[1];

      bot.reply(message, 'BeepBop.. Targeting repo.');
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


      github.repos.createHook(hookData, function resHook(err, data) {
        if (err) {
          err = JSON.parse(err);
          var errorMsg = {
            text: user + '/' + repo + ' ' + err.message
          };

          // send error logs instead if available
          if (err.errors !== undefined) {
            errorMsg.text = 'I am already watching ' + user + '/' + repo;
            bot.reply(message, errorMsg);
            // TO DO enable error logging for other types of errors
            // errorMsg = err.errors[0].message;
          }

        } else {
          if (data.active) {
            var text = {
              text: 'I am now watching ' + user + '/' + repo + '\'s every move'
            };
            bot.reply(message, text);
          }
        }
      });
    }
  );
}

// TO DO - help fail validation (*\/*)
// /watch help
// if (repo.toLowerCase() === 'help') {
//   var helpMessage = {
//     text: 'How to use /watch',
//     attachments: [{
//       text: '`/watch` will show you all current watched repositories.\n`/watch <user>/<repo>` will subscribe you to the repository\'s events',
//       color: 'good',
//       mrkdwn_in: ['text']
//     }]
//   };
//   bot.reply(message, helpMessage);
//   return;
// }

// validation for repo
// TO DO - whitespace validation for repo
// if (repo === undefined || repo === '' || repo === ' ') {
//   bot.reply(message, 'empty value for repo, please read /watch help');
//   return;
// }

// TO DO - user can select events to subscribe to

// call back function that finds id of hook and deletes it, utilised by unwatchRepo
function findHookId(hooks, callback) {
  var hookId;
  hooks.forEach(function findId(hook) {
    // find the relevant hook
    if (hook.config.url === process.env.serverUrl) {
      hookId = hook.id
    }
  });
  callback(hookId);
};

function unwatchRepo(bot, message) {
  var unwatchArg = message.match[1];

  github.repos.getAll(
    {
      type: 'all',
      sort: 'updated'
    },
    function responseRepo(err, repos) {
      if (err) {
        bot.reply(message, 'I\'m sorry, I cannot process your request right now :confused:');
        return;
      }

      repos.forEach(function repoMsg(repo, i) {
        if ((i + 1) === Number(unwatchArg) || unwatchArg === repo.full_name) {
          userRepo = repo.full_name.split('/');
        }
      });

      if (!userRepo) {
        bot.reply(message, 'I\'m sorry, I can\'t find that repository at this time :confused:');
        return;
      }

      var user = userRepo[0];
      var repo = userRepo[1];

      // initial response
      bot.reply(message, 'Hmm..');

      // unwatch help
      if (repo.toLowerCase() === 'help') {
        var helpMessage = {
          text: 'How to use /unwatch',
          attachments: [{
            text: '`/unwatch <user>/<repo>` will unsubscribe from the repository\'s events',
            color: 'good',
            mrkdwn_in: ['text']
          }]
        };
        bot.reply(message, helpMessagse);
        return;
      }

      // get list of hooks
      github.repos.getHooks(
        {
          user: user,
          repo: repo
        },
        // find the id of hook associated to the app
        function getHookCb(err, hooks) {
          if (err) {
            bot.reply(message, 'I\'m sorry, I can not process your request right now :confused:')
          }
          findHookId(hooks, function deleteHook(id) {
            if (id === undefined) {
              bot.reply(message, 'It seems that I am not currently watching ' + user + '/' + repo);
              return;
            }

            // delete hook
            github.repos.deleteHook(
              {
                user: user,
                repo: repo,
                id: id
              },
              function deleteHookCb(err, response) {
                if (response.meta.status === '204 No Content') {
                  var deleteConfirmation = {
                    text: 'Ok! I\'ll stop notifying you of ' + userRepo.join('/') + '\'s events'
                  };
                  bot.reply(message, deleteConfirmation);
                }
              }
            );
          });
        }
      );
    }
  );
}

// function to format new PR message to Slack, utilised by webHookReceiver
function prMessage(data) {
  var pr = data.pull_request;
  var action = data.action;
  var attachments = [];
  var slackMessage;
  var text;

  // Repo and PR title
  var repo = '[' + data.repository.full_name + '] ';
  var prTitle = '#' + pr.number + ' ' + pr.title;

  // Linked Title and User
  var titleLinked = helper.hyperLink(prTitle, pr.html_url);
  var userLink = helper.hyperLink(pr.user.login, pr.user.html_url);

  // PR updated
  if (action === 'synchronize') {
    text = repo + 'Pull request updated: ' + titleLinked + ' by ' + userLink;
  }

  // PR closed
  if (action === 'closed') {
    text = repo + 'Pull request ' + action + ': ' + titleLinked + ' by ' + userLink;
  }

  // PR submitted
  if (action === 'opened') {
    text = repo + 'Pull request submitted by ' + userLink;
    attachments = [{
      title: prTitle,
      title_link: pr.html_url,
      text: pr.body,
      color: 'good'
    }];
  }

  slackMessage = {
    text: text,
    attachments: attachments
  };

  return slackMessage;
}

// lists and formats all commits of a PR, utilised by mergeMessage
function commitsInfo(commits) {
  var info = [];

  commits.forEach(function commitInfo(commit) {
    var message = commit.message;
    var tag;

    // only show first 8 characters of commit id
    var id = '`' + commit.id.slice(0, 8) + '` ';
    var idLinked = helper.hyperLink(id, commit.url);

    // show only commit title, delete body if it exists
    var index = message.indexOf('\n\n');
    if (index > 0) {
      message = message.slice(0, index);
    }

    tag = message + ' - ' + commit.committer.name + '\n';

    // push formatted commit info to info array
    info.push(idLinked + '  ' + tag);
  });

  return info.join('');
}

// formats Push / Merge messages to Slack, utilised by webHookReceiver
// TO DO - make slightly different message for merge and push
function mergeMessage(data) {
  var commits = data.commits;
  var repo = data.repository;

  // Branch
  var branch = data.ref.split('/')[2];
  var branchUrl = repo.url + '/tree/' + branch;
  var branchLinked = helper.hyperLink('[' + repo.name + ':' + branch + ']', branchUrl);

  // Commit Header
  var commitMessage = commits.length + ' new commits ';
  var commitMessageLinked = helper.hyperLink(commitMessage, data.compare);
  var committer = ' by ' + commits[0].committer.name;

  // Individual Commits
  var info = commitsInfo(commits);

  // Slack Message
  var text = branchLinked + ' ' + commitMessageLinked + committer + ' and 1 other:';
  var attachments = [{
    text: info,
    color: 'good',
    mrkdwn_in: ['text']
  }];

  var slackMessage = {
    text: text,
    attachments: attachments
  };

  return slackMessage;
}

// formats and sends PR message to Slack, utilised by checkPRqueue
function prSendSlackMsg(pr) {
  // Repo and Title
  var repo = '[' + pr.base.repo.full_name + ']';
  var title = '#' + pr.number + ' ' + pr.title;

  // Linked PR and user
  var PRLinked = helper.hyperLink(title, pr.html_url);
  var userLink = helper.hyperLink(pr.user.login, pr.user.html_url);

  // Message
  var PRMsg = {
    text: repo + ' Pull request ' + PRLinked + ' by ' + userLink + ' needs to be updated'
  };

  helper.sendHook(process.env.hookUrl, PRMsg);
}

// checks for any remaining PR in queue, called after Push / Merge events
function checkPRqueue(user, repo) {
  github.pullRequests.getAll(
    {
      user: user,
      repo: repo
    },
    // TO DO - refactor synchronizePR as 3rd parameter of checkPRqueue
    function synchronizePR(error, remainingPR) {
      if (error) console.log(error);
      if (remainingPR.length > 0) {
        // send Slack notification of every PR remaining in queue
        remainingPR.forEach(prSendSlackMsg);
      }
    }
  );
}

function webHook(req, res) {
  var event = req.headers['x-github-event'];
  var user = req.body.repository.owner.name;
  var repo = req.body.repository.name;

  // PR
  if (event === 'pull_request') {
    helper.sendHook(process.env.hookUrl, prMessage(req.body));
  }

  // Push / Merge
  if (event === 'push') {
    helper.sendHook(process.env.hookUrl, mergeMessage(req.body));
    // check for any remaining PR
    checkPRqueue(user, repo);
  }

  res.sendStatus(200);
};

function githubHelp(bot, message) {
  var slackMessage = {
    text: '*Github Commands*\n' +
      '`show repos / show <number> repos` - lists all of your repositories or a specified number\n' +
      '`watch <number> / watch <owner/repo>` - subscribes to a repo\'s events and be notified when a pull request is created, updated or merged\n' +
      '`unwatch <number> or <owner/repo>` - unsubscribes from the repository\'s events\n' +
      '`watch <number> / unwatch <number>` - repo numbers are available from `show repos` command'
  };
  bot.reply(message, slackMessage);
}

module.exports = {
  api: github,
  auth: githubAuth,
  repoInfo: repoInfo,
  repoList: repoList,
  getRepo: getRepo,
  watchRepo: watchRepo,
  unwatchRepo: unwatchRepo,
  findHookId: findHookId,
  webHookReceiver: webHook,
  help: githubHelp
};
