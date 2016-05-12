var watson = require('watson-developer-cloud');

require('dotenv').load();

var language_translation = watson.language_translation({
  username: process.env.transUsername,
  password: process.env.transPW,
  version: 'v2'
});

exports.translate = function(bot, message) {
  var text = message.match[2];
  var lang = message.match[1];
  var language;

  if (lang === 'es') {
    language = 'Spanish: *';
  }
  if (lang === 'ar') {
    language = 'Arabic: *';
  }
  if (lang === 'fr') {
    language = 'French: *';
  }
  if (lang === 'pr') {
    language = 'Portugese: *';
  }

  translate(text, lang, function(data) {

    var translated = data.translations[0].translation;

    var slackMessage = {
      text: '_Translated from English to ' + language + translated + '*_'
    }

    bot.reply(message, slackMessage);

  });
};

function translate (text, target, cb) {
  language_translation.translate(
    {
      text: text,
      source: 'en',
      target: target
    },
    function(err, translation) {
      if (err)
        console.log('error:', err);
      else
        cb(translation);
    });
}

// language_translation.translate(
//   {
//     text: 'A sentence must have a verb',
//     source: 'en',
//     target: 'es'
//   },
//   function(err, translation) {
//     if (err)
//       console.log('error:', err);
//     else
//       console.log(JSON.stringify(translation, null, 2));
//   });


// language_translation.identify({
//   text: 'The language translation service takes text input and identifies the language used.' },
//   function (err, language) {
//     if (err)
//       console.log('error:', err);
//     else
//       console.log(JSON.stringify(language, null, 2));
// });
