var Heroku = require('heroku-client');
var db = require('../db/postgres');

require('dotenv').load();

var heroku = new Heroku({
  token: process.env.HEROKU_API_TOKEN
});

// create app
function createBot(env, teamId) {
  heroku.post('/apps',
    {
      // random name
      name: 'karabot-' + Math.floor(Math.random() * 10000)
    },
    function(err, app) {
      if (err) {
        console.log(err);
      } else {
        var botAppId = app.id;
        var botName = app.name;

        buildBot(botAppId);
        setEnv(botAppId, env);

        // save heroku app id and app name
        db.updateAuth(teamId, botAppId, botName);
      }
    }
  );
}

// build app
function buildBot(appId) {
  heroku.post('/apps/' + appId + '/builds',
    {
      source_blob: {
        url: 'https://github.com/Kara-Bot/Karabot-SlackApp/archive/0.0.12.tar.gz',
        version: 'v0.0.10'
      }
    },
    function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    }
  );
}

// set env variables
function setEnv(appId, env) {
  heroku.patch('/apps/' + appId + '/config-vars',
    env,
    function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    }
  );
}

// save info to database

module.exports = {
  createBot: createBot,
  setEnv: setEnv
}
