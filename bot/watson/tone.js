var watson = require('watson-developer-cloud');
var db = require('../../db/postgres');
var Chart = require('quiche');

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
        };
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
          messages.forEach(function concatMessage(message) {
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

function chart(toneData) {
  var bar = new Chart('bar');
  var colors = ['C52500', '408000', '400080', 'FFE72C', '004080'];
  bar.setWidth(400);
  bar.setHeight(265);
  bar.setBarHorizontal();
  bar.setBarSpacing(6);
  bar.addAxisLabels('x', ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100']);
  toneData.tones.forEach(function barAddData(tone, i) {
    bar.addData(tone.score * 100, tone.tone_name, colors[i]);
  });
  var imageUrl = bar.getUrl(true);

  return imageUrl;
}

function user(req, res) {
  var userId = req.body.user;
  var days = req.body.days;

  toneDays(days, 'slack_user_id', userId, res);
}

function channel(req, res) {
  var channelId = req.body.channel;
  var days = req.body.days;

  toneDays(days, 'channel_id', channelId, res);
}

function help(bot, message) {
  var slackMessage = {
    text: '*Tone Commands*\n' +
      '`tone list / tone channels` - lists all channels available\n' +
      '`tone <number> / tone <name>` - shows the emotional and social tone of a channel\n' +
      '`tone help` - shows tone commands'
  };
  bot.reply(message, slackMessage);
}

function channelList(bot, message) {
  var channels = '';
  var slackMessage;

  db.slackRequest(db.channelListForm, function channelListCb(res) {
    res.channels.forEach(function channelName(channel, i) {
      channels += (i + 1).toString() + '  ' + channel.name + '\n';
    });

    slackMessage = {
      text: '*Channels*',
      attachments: [{
        text: channels,
        color: 'good'
      }]
    };

    bot.reply(message, slackMessage);
  });
}

function toneChannel(bot, message) {
  var channelArg = message.match[1];
  var slackMessage;
  var channelId;

  db.slackRequest(db.channelListForm, function channelListCb(res) {
    // find channel id
    res.channels.forEach(function findId(channel, i) {
      if (channel.name === channelArg || (i + 1) === Number(channelArg)) {
        channelId = channel.id;

        // send initial response
        bot.reply(message, 'Beep. Bop. Analysing ' + channel.name + ' channel\'s sentiment..');
      }
    });

    // validation
    if (!channelId) {
      bot.reply(message, 'I\'m sorry I did\'nt recognise that channel, please try again.');
      return;
    }

    var channelMsgForm = {
      url: 'https://slack.com/api/channels.history',
      form: {
        token: process.env.token,
        channel: channelId,
        count: 250
      }
    };

    db.slackRequest(channelMsgForm, function channelMsgCb(res) {
      if (res.error) {
        bot.reply(message, 'I couldn\'t seem to find the channel');
        return;
      }
      var messages = res.messages;
      var text = '';

      // concatenate all message to one long string
      messages.forEach(function concatText(message) {
        text += message.text + '. ';
      });

      // send string to watson
      tone(text, function toneCb(toneArray) {
        delete toneArray.date;
        toneArray.tone.forEach(function chartMsg(tone, i) {
          // skip writing tone analysis - index 1
          var title = ['Emotion Tone', null, 'Social Tone'];
          if (i !== 1) {
            // chart attachment
            slackMessage = {
              attachments: [{
                title: title[i],
                image_url: chart(tone)
              }]
            };

            bot.reply(message, slackMessage);
          }
        });
      });
    });
  });
}

module.exports = {
  channelList: channelList,
  toneChannel: toneChannel,
  channel: channel,
  user: user,
  help: help
};
