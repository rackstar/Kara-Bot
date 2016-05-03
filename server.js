var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var dotenv = require('dotenv');

// configuration ===========================================

// load environment variables,
// either from .env files (development),
// heroku environment in production, etc...
dotenv.load();

// public folder for images, css,... Where our react front-end will live
app.use(express.static(__dirname + '/public'));

// parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing url encoded

// routes
require('./bot/config/routes')(app);

// port for Heroku
app.set('port', (process.env.PORT));

// botkit (apres port)
require('./bot/karabot');

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'));
});

=======
var express = require('botkit/node_modules/express');
var JiraClient = require('jira-connector');
var jiraController = require('./server/jira/jiraController')
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/getIssueTest', jiraController.getJiraIssue)
app.get('/getDashboards', jiraController.getAllDashboards)
app.get('/getProjects', jiraController.getAllProjects)
app.get('/getComponents', jiraController.getProjectComponents)
app.get('/getHighestPriorityIssues', jiraController.getHighestPriorityIssues)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
