var JiraClient = require('jira-connector');

var jira = new JiraClient( {
    host: 'karabot.atlassian.net',
    basic_auth: {
        username: 'admin',
        password: 'ksahrmap16!'
    }
});

module.exports = {
  getJiraIssue: function(req, res){
    var issueParams = {
      issueKey: 'KARA-24'
    };
    jira.issue.getIssue(issueParams, function(error, issue){
      console.log(issue.fields.priority.id);
      res.end();
    })
  },
  getAllDashboards: function(req, res){
    jira.dashboard.getAllDashboards({filter: 'my'}, function(error, dashboards){
      console.log(dashboards);
    })
  },
  getAllProjects: function(req, res){
    jira.project.getAllProjects(null, function(error, projects){
      console.log(projects);
    })
  },
  getProjectComponents: function(req, res){
    jira.project.getComponents({projectIdorKey:'KARA'}, function(error, components){
      console.log(components);
    })
  },
  getHighestPriorityIssues: function(req, res){
    var highestPriorityIssues = "No highest priority issues!";
    jira.search.search({jql: 'project=10000'}, function(error, project){
      for(var i = 0; i < project.issues.length; i++){
        if(project.issues[i].fields.priority.id === '1'){
          if(typeof highestPriorityIssues === 'string'){
            highestPriorityIssues = [];
          }
          highestPriorityIssues.push(project.issues[i]);
        }
      }
      res.send(highestPriorityIssues);
    })
  }
}