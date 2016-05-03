var GitHubApi = require('github');
var fs = require('fs');
var request = require('request');

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

require('dotenv')
  .config();

// Authentication
github.authenticate({
  type: 'basic',
  username: process.env.username,
  password: process.env.password
});

// Repo
// get all repo and let user pick which one should be watched
// github.repos.getAll(
//   {
//     type: 'owner', // all, owner, public, or private.
//     page: 1,
//     // sort: 'updated'


//     // direction: 'String',
//     // per_page: 'Number'*/
//   },
//   function resAllRepo(err, res) {
//     // TO DO error handling
//     // TO DO - show user list of repo
//     // then make them choose repos to be watched
//     console.log(res, 'REPO');
//   }
// );

// WebHook
// create webhook for chosen repo
// github.repos.createHook(
//   {
//     name: 'web',
//     active: true,
//     user: 'Kara-Bot',
//     repo: 'Test-Repo',
//     events: [
//       'commit_comment',
//       'create',
//       'delete',
//       'deployment_status',
//       'issues',
//       'issue_comment',
//       'pull_request',
//       'pull_request_review_comment',
//       'push',
//       'release',
//       'fork'
//     ],
//     config: {
//       url: 'https://hooks.slack.com/services/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', // TO DO - create heroku website to receive payload
//       // or slack webhook url
//       content_type: 'json'
//     }
//   },
//   function resCreateHook(err, res) {
//     // TO DO error handling
//     if (res) {
//       console.log(res, 'WebHook Created');
//     }
//   }
// );
//
var hyperLink = function(string, url) {
  return '<' + url + '|' + string + '>';
};

var prMessage = function prMessage(payload) {
  var pr = payload.pull_request;
  var action = payload.action;

  var prTitle = '#' + pr.number + ' ' + pr.title;
  var repo = '[' + payload.repository.full_name + '] ';
  var userLink = hyperLink(pr.user.login, pr.user.html_url);

  // convert PR opened to PR submitted
  if (action === 'opened') {
    action = 'submitted';
  }

  var slackMessage = {
    text: repo + 'Pull request ' + action + ' by ' + userLink,
    attachments: [
      {
        title: prTitle,
        title_link: pr.html_url,
        text: pr.body,
        color: 'good',
      }
    ]
  };
  // make a more concise message on PR close
  if (action === 'closed') {
    delete slackMessage.attachments;
    var titleLinked = hyperLink(prTitle, pr.html_url);
    slackMessage.text = repo + 'Pull request ' + action + ': ' + titleLinked + ' by ' + userLink;
  }

  return slackMessage;
};

var commitsInfo = function commitsInfo(commits) {
  var info = [];

  commits.forEach(function (commit, i, commits) {
    var id = '`' + commit.id.slice(0,8) + '` ';
    var idLinked = hyperLink(id, commit.url);
    // show only commit title
    var message = commit.message;
    var index = message.indexOf('\n\n');

    if (index > 0) {
      message = message.slice(0, index);
    }

    var tag = message + ' - ' + commit.committer.name + '\n';

    info.push(idLinked + '  ' + tag);
  });

  return info.join('');
};

var mergeMessage = function mergeMessage(payload) {
  var commits = payload.commits;
  var repo = payload.repository;
  // Branch
  var branch = payload.ref.split('/')[2];
  var branchUrl = repo.url + '/tree/' + branch;
  var branchLinked = hyperLink('[' + repo.name + ':' + branch + ']', branchUrl);
  // Commit Header
  var commitMessage = commits.length + ' new commits ';
  var commitMessageLinked = hyperLink(commitMessage, payload.compare);
  var committer = ' by ' + commits[0].committer.name;
  // Individual Commits
  var info = commitsInfo(commits);

  var slackMessage = {
    text: branchLinked + ' ' + commitMessageLinked + committer + ' and 1 other:',
    attachments: [
      {
        text: info,
        color: 'good',
        mrkdwn_in: ['text']
      }
    ],
    mrkdwn: true
  };

  return slackMessage;
};

var sendHook = function sendHook(url, json) {
  request(
    {
      url: url,
      method: 'POST',
      json: json
    },
    function(err, httpResponse, body) {
      console.log(body);
    }
  );
};

exports.webHookReceiver = function webHook(req, res) {
  console.log(req.body, 'BODY REQ');
  var event = req.headers['x-github-event'];
  var slackHookUrl = 'https://hooks.slack.com/services/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';

  // PR
  if (event === 'pull_request') {
    // synchronized PR are not posted
    // if (req.body.action !== 'synchronized') {
      var slackMessage = prMessage(req.body);
      sendHook(slackHookUrl, slackMessage);
    // }
    res.sendStatus(200);
  }

  // MERGE
  if (event === 'push') {
    var slackMessage = mergeMessage(req.body);
    sendHook(slackHookUrl, slackMessage);
    res.sendStatus(200);
    // check if there are remaining PR
      // if yes, tell user has to synchronize PR and rebase
    // Pull Request
    github.pullRequests.getAll(
      {
        user: 'Kara-Bot',
        repo: 'Test-Repo' // TO DO - change to chose repo
      },
      function allPR(error, response) {
        // TO DO error handling
        if (error) { console.log(error); }
        if (response.length > 0) {
          response.forEach(function(PR) {
            var title = '#' + PR.number + ' ' + PR.title;
            var PRLinked = hyperLink(title, PR.html_url);
            var userLink = hyperLink(PR.user.login, PR.user.html_url);
            var repo = '[' + PR.base.repo.full_name + ']';
            var PRMsg = {
              text: repo + ' Pull request ' + PRLinked + ' by ' + userLink + ' must be synchronized'
            };
            sendHook(slackHookUrl, PRMsg);
          });
        }
      }
    );
  }
};