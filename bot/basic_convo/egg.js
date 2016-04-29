var Botkit = require('botkit');

var controller = Botkit.slackbot({
  debug: true
});


function hitch(bot, message) {
  bot.reply(message, '42');
}

function konami(bot, message) {
  bot.reply(message, '↑ ↑ ↓ ↓ ← → ← → Ⓑ Ⓐ START');
}

module.exports = {
  hitch: hitch,
  konami: konami
};
