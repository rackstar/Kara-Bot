var GitHubApi = require('github');
var helper = require('../config/helper');
var fs = require('fs');

var serverUrl = 'https://karabot-eng.herokuapp.com/github'
var slackHookUrl = 'https://hooks.slack.com/services/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';

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

require('dotenv').config();

// Authentication
github.authenticate({
  type: 'basic',
  username: process.env.username,
  password: process.env.password
});


function repoInfo(repos) {
  var info = [];

  repos.forEach(function(repo) {
    var repoLinked = helper.hyperLink(repo.full_name, repo.html_url);
    info.push(repoLinked + '\n');
  });

  return info.join('');
}

function repoList(repoInfo, count) {
  var text = count + ' most recent repositories:';

  if (typeof count === 'string') {
    text = 'All your current repositories:';
  }

  var slackMessage = {
    text: text,
    attachments: [{
      text: repoInfo,
      color: 'good'
    }]
  };

  return slackMessage;
}
// Repo
exports.getRepo = function getRepo(req, res) {
  var list;
  // verify token
  var slashToken = req.body.token;

  var resUrl = req.body.response_url;
  var count = req.body.text;

  github.repos.getAll(
    {
      type: 'all', // all, owner, public, member or private.
      sort: 'updated' //  created|updated|pushed|full_name
    },
    function resAllRepo(err, repos) {
      if (err) console.log(err);

      if (Number(count)) {
        // round the number if not an integer
        count = Math.round(count);
        // only show the number of requested repos
        repos = repos.slice(0, count);
      }

      // regex validation integer or empty string
      var reg = /^(\s*|\d+)$/

      if (reg.test(count)) {
        list = repoList(repoInfo(repos), count);
        helper.sendHook(resUrl, list);
      } else {
        res.json({error: 'must be an integer or all'});
      }
    }
  );
}

// WebHook
function createHook(user, repo, url) {
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
      url: url,
      content_type: 'json'
    }
  };

  github.repos.createHook(hookData, function resHook(err, res) {
    if (err) console.log(err);
    console.log(res, 'WebHook Created');
  });
}

function prMessage(payload) {
  var pr = payload.pull_request;
  var action = payload.action;
  var slackMessage;
  var attachments;
  var text;

  // Repo and PR title
  var repo = '[' + payload.repository.full_name + '] ';
  var prTitle = '#' + pr.number + ' ' + pr.title;

  // Linked Title and User
  var titleLinked = helper.hyperLink(prTitle, pr.html_url);
  var userLink = helper.hyperLink(pr.user.login, pr.user.html_url);

  // PR submitted
  if (action === 'opened') {
    action = 'submitted';
    text = repo + 'Pull request ' + action + ' by ' + userLink;
    attachments = [{
      title: prTitle,
      title_link: pr.html_url,
      text: pr.body,
      color: 'good'
    }];
  }

  // PR closed
  if (action === 'closed') {
    text = repo + 'Pull request ' + action + ': ' + titleLinked + ' by ' + userLink;
  }

  slackMessage = {
    text: text,
    attachments: attachments || []
  };

  return slackMessage;
}

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

    info.push(idLinked + '  ' + tag);
  });

  return info.join('');
}

function mergeMessage(payload) {
  var commits = payload.commits;
  var repo = payload.repository;

  // Branch
  var branch = payload.ref.split('/')[2];
  var branchUrl = repo.url + '/tree/' + branch;
  var branchLinked = helper.hyperLink('[' + repo.name + ':' + branch + ']', branchUrl);

  // Commit Header
  var commitMessage = commits.length + ' new commits ';
  var commitMessageLinked = helper.hyperLink(commitMessage, payload.compare);
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

function prSlackMsg(PR) {
  // Repo and Title
  var repo = '[' + PR.base.repo.full_name + ']';
  var title = '#' + PR.number + ' ' + PR.title;

  // Linked PR and user
  var PRLinked = helper.hyperLink(title, PR.html_url);
  var userLink = helper.hyperLink(PR.user.login, PR.user.html_url);

  // Message
  var PRMsg = {
    text: repo + ' Pull request ' + PRLinked + ' by ' + userLink + ' must be synchronized'
  };

  helper.sendHook(slackHookUrl, PRMsg);
}

function checkPRqueue(user, repo) {
  // TO DO - delete hard coded user and repo
  github.pullRequests.getAll(
    {
      user: user || 'Kara-Bot',
      repo: repo || 'Test-Repo'
    },
    function synchronizePR(error, remainingPR) {
      if (error) console.log(error);
      if (remainingPR.length > 0) {
        // send Slack notification of every PR remaining in queue
        remainingPR.forEach(prSlackMsg);
      }
    }
  );
}

exports.webHookReceiver = function webHook(req, res) {
  var event = req.headers['x-github-event'];

  // PR
  if (event === 'pull_request') {
    // TO DO - include syncronized PR on slack notification or not?
    helper.sendHook(slackHookUrl, prMessage(req.body));
    res.sendStatus(200);
  }

  // Push / Merge
  if (event === 'push') {
    helper.sendHook(slackHookUrl, mergeMessage(req.body));
    res.sendStatus(200);
    // check for any remaining PR
    // TO DO - pass in user and repo
    checkPRqueue();
  }
};
