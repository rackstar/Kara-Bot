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
  tomorrow.setHours(24, 0, 0, 0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'days events', tomorrow);
}

function cdayaft(bot, message) {
  bot.reply(message, '_I\'m searching..._');
  var tomorrow = new Date;
  // This is 12:00:00am day after next in THIS time zone
  tomorrow.setHours(48, 0, 0, 0);
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
  tomorrow.setHours(24, 0, 0, 0);
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'free slots', tomorrow);
}

function cnew(bot, message) {
  var errorText = '_Sorry, I don\'t understand_ ';
  var args = message.text.split(' ');
  if (args.length < 4) {
    if (args.length === 1) {
      bot.reply(message, '_format is:_  startHour[:startMinute]  endHour[:endMinute]  Event_Title  [*|* Event_Location]');
      return;
    }
    bot.reply(message, errorText + args.slice(1) + '  _(just type_  cnew  _for format of input)_');
    return;
  }
  var start = args[1].split(':');
  var startHour = Number(start[0]);
  if (Number.isNaN(startHour) || startHour < 0 || startHour > 23) {
    bot.reply(message, errorText + start[0]);
    return;
  }
  var startMinute = 0;
  if (start.length > 1) {
    startMinute = Number(start[1]);
    if (Number.isNaN(startMinute) || startMinute < 0 || startMinute > 59) {
      bot.reply(message, errorText + start[1]);
      return;
    }
  }

  var end = args[2].split(':');
  var endHour = Number(end[0]);
  if (Number.isNaN(endHour) || endHour < 0 || endHour > 23) {
    bot.reply(message, errorText + end[0]);
    return;
  }
  var endMinute = 0;
  if (end.length > 1) {
    endMinute = Number(end[1]);
    if (Number.isNaN(endMinute) || endMinute < 0 || endMinute > 59) {
      bot.reply(message, errorText + end[1]);
      return;
    }
  }

  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    bot.reply(message, errorText + 'that time range');
    return;
  }

  // time inputs have passed validation
  var startDate = new Date;
  var endDate = new Date;
  startDate.setHours(startHour, startMinute, 0, 0);
  endDate.setHours(endHour, endMinute, 0, 0);
  var eventText = args.slice(3).join(' ');
  var eventLocation = '';
  if (eventText.includes('|')) {
    eventLocation = eventText.slice(eventText.indexOf('|') + 1);
    eventText = eventText.slice(0, eventText.indexOf('|'));
  }
  var insertData = {
    summary: eventText,
    location: eventLocation,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
  googCal.authCallFunction(function (data) {
    bot.reply(message, data);
  }, 'insert event', insertData);
}

function chelp(bot, message) {
  var commands = '```';
  commands += 'clist    - list calendars\n';
  commands += 'ctoday   - events today\n';
  commands += 'ctomo    - events tomorrow\n';
  commands += 'cdayaft  - events day after tomorrow\n';
  commands += 'cfree    - free blocks today\n';
  commands += 'cfreetom - free blocks tomorrow\n';
  commands += 'cnew     - add an event today';
  commands += '```';
  bot.reply(message, commands);
}

module.exports = {
  clist: clist,
  ctoday: ctoday,
  ctomo: ctomo,
  cdayaft: cdayaft,
  cfree: cfree,
  cfreetom: cfreetom,
  cnew: cnew,
  chelp: chelp
};
