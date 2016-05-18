var request = require('request');
var helper = require('../../db/postgres.js');
var heroku = require('../../heroku/heroku');
var db = require('../../db/postgres');

require('dotenv').config();

module.exports = function auth(req, res) {
  var code = req.query.code;
  // var state = req.query.state;

  // security check
  // if (req.query.state !== /*state that was given*/) {
  //   // end the auth process
  // }

  var authForm = {
    url: 'https://slack.com/api/oauth.access',
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: code
    }
  };

  helper.slackRequest(authForm, function(body) {
    if (body.error) {
      console.log(body.error);
    } else {
      console.log(body);
      // app token - has channel history permission - never expires
      var appToken = body.access_token;
      // app permissions
      var scope = body.scope;
      // user who install the app
      var userId = body.user_id;
      // Team info
      var teamName = body.team_name;
      var teamId = body.team_id;
      // Bot info
      var botId = body.bot.bot_user_id;
      var botToken = body.bot.bot_access_token;

      var columns = '(slack_app_token, user_id, team_name, team_id, bot_id, bot_token)';
      var values = [appToken, userId, teamName, teamId, botId, botToken];
      var valuesHolder = 'values($1, $2, $3, $4, $5, $6)'
      // save to database
      db.insert('auth', columns, values, valuesHolder);

      var env = {
        // slack
        token: body.bot.bot_access_token,
        APP_TOKEN: body.access_token,

        // watson
        toneUser: process.env.toneUser,
        tonePw: process.env.tonePw,
        transPW: process.env.transPW,
        transUsername: process.env.transUsername,

        // weather
        weatherKey: process.env.weatherKey
      };

      // TO DO - delete tokens if authorisation are revoked / kill bot app

      // select(cb, table, column, value, property)
      // get auth database id of user registered
      db.select(function(data) {
          // create bot, pass in auth database id
          var authId = data[0];
          heroku.createBot(env, authId);
        },
        'auth',
        'bot_token',
        botToken,
        'auth_id'
      );
    }
  });
};
