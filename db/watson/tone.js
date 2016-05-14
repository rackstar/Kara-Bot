var watson = require('watson-developer-cloud');
var helper = require('../helper');

require('dotenv').load();

var tone_analyzer = watson.tone_analyzer({
  username: process.env.toneUser,
  password: process.env.tonePw,
  version: 'v3-beta',
  version_date: '2016-02-11'
});

// TO DO - add select range dates functionality

function tone(data, res) {
  tone_analyzer.tone(
    {
      text: data.join(' ')
    },
    function toneCB(err, tone) {
      if (err) {
        console.log(err);
      } else {
        res.send(tone.document_tone);
      }
    }
  );
}

function selectMsgs(columnId, value, res) {
  helper.select(
    function toneRes(data) {
      tone(data, res);
    },
    'messages',
    columnId,
    value,
    'message_text'
  );
}

exports.user = function user(req, res) {
  var userId = req.body.user;
  selectMsgs('slack_user_id', userId, res);
};

exports.channel = function channel(req, res) {
  var channelId = req.body.channel;
  selectMsgs('channel_id', channelId, res);
};
