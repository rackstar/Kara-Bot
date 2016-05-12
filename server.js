var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var dotenv = require('dotenv');
var JiraClient = require('jira-connector');
var jiraController = require('./server/jira/jiraController');
var jwt = require('express-jwt');
var db = require('./db/postgres');
var pg = require('pg');

// configuration ===========================================

// load environment variables,
// either from .env files (development),
// heroku environment in production, etc...
dotenv.load();

// Auth0 requirement for API calls
var jwtCheck = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

// public folder for images, css,... Where our react front-end will live
app.use(express.static(__dirname + '/public'));

// parsing
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing url encoded

// Block users who aren't logged in from doing requests on api data
app.use('/api/', jwtCheck);

// routes
require('./bot/config/routes')(app);

// port for Heroku
app.set('port', (process.env.PORT));

// botkit (apres port)
require('./bot/karabot');

// DATABASE ===================================================

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/karabot';

var client = new pg.Client(connectionString);
client.connect();

client.query('CREATE TABLE IF NOT EXISTS channels(channel_id SERIAL PRIMARY KEY, channel_name VARCHAR(40), slack_channel_id VARCHAR(40))');
client.query('CREATE TABLE IF NOT EXISTS users(user_id SERIAL PRIMARY KEY, username VARCHAR(40) not null, slack_user_id VARCHAR(40), firstname VARCHAR(40), lastname VARCHAR(40), email VARCHAR(40), is_bot BOOLEAN)');
client.query('CREATE TABLE IF NOT EXISTS messages(message_id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, message_text TEXT, slack_ts VARCHAR(40), slack_user_id VARCHAR(40), channel_id VARCHAR(40) not null)');
var query = client.query('CREATE TABLE IF NOT EXISTS channel_user(join_id SERIAL PRIMARY KEY, slack_user_id VARCHAR(40), channel_id VARCHAR(40) not null)');

// populate DB after tables are created
query.on('end', function() {
  client.end();
  db.populateDB();
  // populate db every 2 hours
  setInterval(function() {
    db.populateDB();
    console.log('db populated');
  }, 1000 * 60 * 60 * 2);
});
  

// START ===================================================
http.listen(app.get('port'), function () {
  console.log('listening on port ' + app.get('port'));
});

