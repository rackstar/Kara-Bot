var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
  debug: true,
});

module.exports = {
  hitch: hitch,
  konami: konami
};

function hitch(bot, message) {
  bot.reply(message, '42');
}

function konami(bot, message) {
  bot.reply(message, '↑ ↑ ↓ ↓ ← → ← → Ⓑ Ⓐ START');
}