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

var format

var formatJiraMessage = function (payload) {
  var issueFields;
  var title;
  var issueDescription;
  var issueAssignee;
  payload.issue ? issueFields = payload.issue.fields : issueFields = payload.fields;
  payload.issue ? title = payload.issue.key : title = payload.key;
  issueFields.description ? issueDescription = issueFields.Description : 'No description';
  issueFields.assignee ? issueAssignee = issueFields.assignee.name : 'No assignee';

  var issueInfo = {
    title: title,
    summary: issueFields.summary,
    description: issueDescription,
    assignee: issueAssignee,
    issueLink: 'https://karabot.atlassian.net/browse/' + title
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
          console.log(project.issues[i]);
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
