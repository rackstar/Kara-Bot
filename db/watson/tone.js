var watson = require('watson-developer-cloud');
var helper = require('../helper');

require('dotenv').load();

var tone_analyzer = watson.tone_analyzer({
  username: process.env.toneUser,
  password: process.env.tonePw,
  version: 'v3-beta',
  version_date: '2016-02-11'
});

// get Channel Id or user Id from front-end

var cb = function(data) {
  data = data.join(' ');

  tone_analyzer.tone(
    {
      text: data
    },
    function(err, tone) {
      if (err) {
        console.log(err);
      } else {
        console.log(JSON.stringify(tone, null, 2));
      }
    }
  );
};

helper.select(cb, 'messages', 'channel_id', 'C155RNX46', 'message_text');
