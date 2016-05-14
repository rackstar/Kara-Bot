var watson = require('watson-developer-cloud');
var helper = require('../helper');
var db = require('../postgres');

require('dotenv').load();

var tone_analyzer = watson.tone_analyzer({
  username: process.env.toneUser,
  password: process.env.tonePw,
  version: 'v3-beta',
  version_date: '2016-02-11'
});

function tone(data, cb) {
  tone_analyzer.tone(
    {
      text: data
    },
    function toneCB(err, tone) {
      if (err) {
        console.log(err);
      } else {
        var toneObj = {
          tone: tone.document_tone.tone_categories
        }
        // because the date has been passed to the API, the tone sentences would contain the date
        // grab the date
        if (tone.sentences_tone !== undefined) {
          toneObj.date = tone.sentences_tone[0].text;
        }
        cb(toneObj);
      }
    }
  );
}

function selectMsgs(column, value, res) {
  helper.select(
    function toneRes(data) {
      tone(data, res);
    },
    'messages',
    column,
    value,
    'message_text'
  );
}

function filterEmptyString(toneResults) {
  var tones = toneResults.tone[0].tones;

  var anger = tones[0].score;
  var disgust = tones[1].score;
  var fear = tones[2].score;
  var joy = tones[3].score;
  var sadness = tones[4].score;

  // empty string would always have the values below
  if (anger === 0.113779 &&
     disgust === 0.179621 &&
     fear === 0.187314 &&
     joy === 0.446845 &&
     sadness === 0.214693)
  {
    // if it matches replace results with 'no messages found'
    delete toneResults.tone;
    toneResults.text = 'no messages found';
  }

  return toneResults;
}

function toneDays(numOfDays, column, value, res) {
  var day = 60 * 60 * 24 * 1000;
  var results = [];
  var text;
  // default 7 days history
  numOfDays = numOfDays || 7;

  for (var i = numOfDays; i > 0; i--) {
    // divide numOfDays to 24 hours slots
    var startTs = new Date().getTime() - (day * i);
    var endTs = new Date().getTime() - (day * (i - 1));

    // initiate a calls counter to help determine when to send data back
    var callsLeft = numOfDays;

    // msgsAfterTs(cb, column, columnValue, startTs, endTs)
    db.msgsAfterTs(
      function toneRes(messages) {
        if (messages.length) {
          // add date to text string for date reference
          text = messages[0].date + '. ';
          // concatenate all the message into one long string
          messages.forEach(function(message) {
            text += message.message + '. ';
          });
        } else {
          // if no messages found pass empty string
          text = ' ';
        }

        // pass text to be analyse
        tone(text, function toneCb(toneResults) {
          // filter if its a response for the empty string
          toneResults = filterEmptyString(toneResults);

          results.push(toneResults);

          callsLeft--;

          // if all calls are made send results
          if (callsLeft === 0) {
            res.send(results);
          }
        });
      },
      column,
      value,
      startTs,
      endTs
    );
  }
}

exports.user = function user(req, res) {
  var userId = req.body.user;
  var days = req.body.days;

  toneDays(days, 'slack_user_id', userId, res);
};

exports.channel = function channel(req, res) {
  var channelId = req.body.channel;
  var days = req.body.days;

  toneDays(days, 'channel_id', channelId, res);
};
