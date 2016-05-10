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
  }, 'days events', new Date());
}

function ctomo(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  var tomorrow = new Date;
  // This is 12:00:00am next day in THIS time zone
  tomorrow.setHours(24,0,0,0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'days events', tomorrow);
}

function cdayaft(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  var tomorrow = new Date;
  // This is 12:00:00am day after next in THIS time zone
  tomorrow.setHours(48,0,0,0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'days events', tomorrow);
}

function cfree(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'free slots', new Date);
}

function cfreetom(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  var tomorrow = new Date;
  // This is 12:00:00am next day in THIS time zone
  tomorrow.setHours(24,0,0,0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'free slots', tomorrow);
}

function ctest(bot, message) {
  var args = message.text.split(' ');
  if (args.length < 4) {
    bot.reply(message, '_Sorry, I don\'t understand_ ' + args);
    return;
  }
  var start = args[1].split(':');
  var startHour = Number(start[0]);
  if (Number.isNaN(startHour) || startHour < 0 || startHour > 23) {
    bot.reply(message, '_Sorry, I don\'t understand_ ' + start[0]);
    return;
  }
  if (start.length > 1) {
    var startMinute = Number(start[1]);
    if (Number.isNaN(startMinute) || startMinute < 0 || startMinute > 59) {
         bot.reply(message, '_Sorry, I don\'t understand_ ' + start[1]); 
         return;
    }
    // build start time with minutes
  } else {
    // build start time without minutes
  }
  
  var end = args[2].split(':');
  var endHour = Number(end[0]);
  if (Number.isNaN(endHour) || endHour < 0 || endHour > 23) {
    bot.reply(message, '_Sorry, I don\'t understand_ ' + end[0]);
    return;
  }
  if (end.length > 1) {
    var endMinute = Number(end[1]);
    if (Number.isNaN(endMinute) || endMinute < 0 || endMinute > 59) {
         bot.reply(message, '_Sorry, I don\'t understand_ ' + end[1]); 
         return;
    }
    // build end time with minutes
  } else {
    // build end time without minutes
  }
  
  // if (startTime > endTime) {
  //   bot.reply(message, '_Sorry, I don\'t understand_' ); 
  // }
    
  console.log('Hello from ctest!', '>' + message.text + '<');
  // bot.reply(message, 'Hello from ctest!!');
}

module.exports = {
  clist: clist,
  ctoday: ctoday,
  ctomo: ctomo,
  cdayaft: cdayaft,
  cfree: cfree,
  cfreetom: cfreetom,
  ctest: ctest
};
