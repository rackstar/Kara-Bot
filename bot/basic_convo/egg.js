var kara = require('../karabot.js');

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
