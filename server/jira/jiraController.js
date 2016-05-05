var JiraClient = require('jira-connector');
var request = require('request')

require('dotenv').config();

var jira = new JiraClient({
  host: 'karabot.atlassian.net',
  basic_auth: {
    username: process.env.jiraUser,
    password: process.env.jiraPassword
  }
});

var constructSlackUrl = function (string, url) {
  return '<' + url + '|' + string + '>';
}

var formatJiraMessage = function (payload) {
  var issueFields = payload.issue.fields;
  var issueDescription = issueFields.description || 'No description';
  var issueAssignee = issueFields.assignee.name || 'No assignee';

  var issueInfo = {
    title: payload.issue.key,
    summary: issueFields.summary,
    description: issueDescription,
    assignee: issueAssignee,
    issueLink: 'https://karabot.atlassian.net/browse/' + payload.issue.key
  }
  return issueInfo; 
}

var formatIssueQueryMessage = function (payload) { 
  var issue = formatJiraMessage(payload);
  var issueLink = constructSlackUrl('View in JIRA', issue.issueLink)
  var message = {
    text: '*New highest priority issue created*',
    attachments: [
      {
        title: issue.title,
        color: 'danger',
          fields: [
            {
              title: "Summary",
              value: issue.summary,
              short: false
            },
            {
              title: "Description",
              value: issue.description,
              short: false
            },
            {
              title: "Assignee",
              value: issue.assignee,
              short: false
            },
            {
              title: "Link",
              value: issueLink,
              short: false
            }
        ],
      }
    ],
    mkdwn: true
  };
  return message;
};

var sendSlackMessage = function (message) {
    var jsonMessage = formatIssueQueryMessage(message)
    return {
      method: 'POST',
      url:'https://hooks.slack.com/services/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',
      json: jsonMessage
    }
};

module.exports = {
  getHighestPriorityIssues: function (req, res) {
    var highestPriorityIssues = []
    jira.search.search({ jql: 'project=10000' }, function (error, project) {
      var highestPriorityIssues = [];
      for (var i = 0; i < project.issues.length; i++){
        if (project.issues[i].fields.priority.id === '1') {
          var formattedIssue = formatJiraMessage(project.issues[i]);
          // console.log('****FORMATTED ISSUE*****',formattedIssue);
          highestPriorityIssues.push(formattedIssue);
        }
      }
      if(highestPriorityIssues.length === 0){
        res.send('No highest priority JIRA issues!')
      } else {
        res.send(highestPriorityIssues);
      }
    });
  },

  handleJiraWebhooksIssues: function (req, res) {
    if(req.body.issue.fields.priority.id === '1'){
      request(sendSlackMessage(req.body), function (error, response) {
        if (error) {
          console.log(error.message);
        } else {
          console.log('Message sent');
        }
      });
    res.end();
    }
  }
};
