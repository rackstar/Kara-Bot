var watson = require('watson-developer-cloud');

require('dotenv').load();

var language_translation = watson.language_translation({
  username: process.env.transUsername,
  password: process.env.transPW,
  version: 'v2'
});

function watsonTranslate(text, target, cb) {
  language_translation.translate(
    {
      text: text,
      source: 'en',
      target: target
    },
    function translated(err, data) {
      if (err) {
        console.log('error:', err);
      } else {
        cb(data.translations[0].translation);
      }
    });
}

exports.translate = function translate(bot, message) {
  var text = message.match[2];
  var lang = message.match[1];
  var language;
  var reply;

  if (lang === 'es') {
    language = 'Spanish:';
  } else if (lang === 'ar') {
    language = 'Arabic:';
  } else if (lang === 'fr') {
    language = 'French:';
  } else if (lang === 'pt') {
    language = 'Portugese:';
  } else if (lang === 'it') {
    language = 'Italian:';
  } else {
    reply = {
      text: 'I\'m sorry, I don\'t know that language yet. Here are the languages i know:\n' +
            '_Spanish (-es), French (-fr), Italian (-it), Portugese (-pt) and Arabic (-ar)_'
    };
    bot.reply(message, reply);
    return;
  }

  watsonTranslate(text, lang, function botReply(translated) {
    var slackMessage = {
      text: '_Translated from English to ' + language + '_\n' +
            '_*' + translated + '*_'
    };
    bot.reply(message, slackMessage);
  });
};
