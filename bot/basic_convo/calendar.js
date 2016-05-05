var googCal = require('../calendar/googCalendar.js');

function clist(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  googCal.authCallFunction( function(data) {
    bot.reply(message, 'Ok, here\'s the results:\n' + data)
  }, 'calendar list');  
}

function ctoday(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  googCal.authCallFunction( function(data) {
    bot.reply(message, 'Ok, here\'s the results:\n' + data)
  }, 'days events');  

  // googCal.authCallFunction( 'null', 'days events');
}

module.exports = {
  clist: clist,
  ctoday: ctoday
};
