var request = require('request');
var helper = require('../../db/postgres.js');
var heroku = require('../../heroku/heroku');

require('dotenv').config();

module.exports = function auth(req, res) {
  var code = req.body.code;
  // var state = req.body.state;

  // security check
  // if (req.body.state !== /*state that was given*/) {
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

      var env = {
        token: body.bot.bot_access_token,
        APP_TOKEN: body.access_token
      };

      // save to database
      // res.status(201);
      // create multiple node instances for each registration
      // delete tokens if authorisation are revoked / kill node instance

      // create bot
      heroku.createBot(env);
    }
  });
};
