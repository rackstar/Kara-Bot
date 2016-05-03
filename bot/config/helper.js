var request = require('request');

function hyperLink(string, url) {
  return '<' + url + '|' + string + '>';
}

function sendHook(url, json) {
  request(
    {
      url: url,
      method: 'POST',
      json: json
    },
    function sendHookResponse(err, httpResponse, body) {
      console.log(body);
    }
  );
}

module.exports = {
  hyperLink: hyperLink,
  sendHook: sendHook
};
