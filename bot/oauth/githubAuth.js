var request = require('request');

require('dotenv').load();

var authForm = {
  url: 'https://github.com/login/oauth/access_token',
  form: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
  }
};

request.post(form)