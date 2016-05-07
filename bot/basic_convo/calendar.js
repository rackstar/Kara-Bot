var googCal = require('../calendar/googCalendar.js');

function clist(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  googCal.authCallFunction(function (data) {
    bot.reply(message, 'Ok, here are the results:\n' + data);
  }, 'calendar list');
}

function ctoday(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'days events', (new Date()).toISOString());
}

function ctomo(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  var tomorrow = (new Date);
  tomorrow.setHours(24,0,0,0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'days events', tomorrow.toISOString());
}

module.exports = {
  clist: clist,
  ctoday: ctoday,
  ctomo: ctomo
};
