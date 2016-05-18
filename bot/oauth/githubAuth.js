var request = require('request');
var heroku = require('../../heroku/heroku');

require('dotenv').load();

module.exports = function githubAuth (req, res) {
  var code = req.query.code;
  // var state = req.query.state;

  // security check
  // if (req.query.state !== /*state that was given*/) {
  //   // end the auth process
  // }

  var authForm = {
    url: 'https://github.com/login/oauth/access_token',
    form: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
    }
  };

  request.post(form, function(err, response, body) {
    // var githubToken =

    // var env = {
    //   GITHUB_TOKEN: githubToken
    // };

    // set env to heroku
    // heroku.setEnv( serialize(), env);
    
    // save to database github token
  });
}