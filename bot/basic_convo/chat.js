var os = require('os');
var kara = require('../karabot.js');

function greet(bot, message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face'
  }, function errCheck(err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  });

  kara.controller.storage.users.get(message.user, function sayHello(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Hello ' + user.name + '!!');
    } else {
      bot.reply(message, 'Hello.');
    }
  });
}

function myname(bot, message) {
  var name = message.match[1];
  kara.controller.storage.users.get(message.user, function storeName(err, user) {
    if (!user) {
      user = {
        id: message.user
      };
    }
    user.name = name;
    kara.controller.storage.users.save(user, function saveName(err, id) {
      bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
    });
  });
}

function sayname(bot, message) {
  kara.controller.storage.users.get(message.user, function findName(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Your name is ' + user.name);
    } else {
      bot.startConversation(message, function nameConvo(err, convo) {
        if (!err) {
          convo.say('I do not know your name yet!');
          convo.ask('What should I call you?', function getName(response, convo) {
            convo.ask('You want me to call you `' + response.text + '`?', [
              {
                pattern: 'yes',
                callback: function completeConvo(response, convo) {
                  // since no further messages are queued after this,
                  // the conversation will end naturally with status == 'completed'
                  convo.next();
                }
              },
              {
                pattern: 'no',
                callback: function stopConvo(response, convo) {
                  // stop the conversation. this will cause it to end with status == 'stopped'
                  convo.stop();
                }
              },
              {
                default: true,
                callback: function repeatConvo(response, convo) {
                  convo.repeat();
                  convo.next();
                }
              }
            ]);
            convo.next();
          }, { key: 'nickname' }); // store the results in a field called nickname

          convo.on('end', function endConvo(convo) {
            if (convo.status === 'completed') {
              bot.reply(message, 'OK! I will update my dossier...');

              kara.controller.storage.users.get(message.user, function getUser(err, user) {
                if (!user) {
                  user = {
                    id: message.user
                  };
                }
                user.name = convo.extractResponse('nickname');
                kara.controller.storage.users.save(user, function saveName(err, res) {
                  bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                });
              });
            } else {
              // this happens if the conversation ended prematurely for some reason
              bot.reply(message, 'OK, nevermind!');
            }
          });
        }
      });
    }
  });
}

function shutdown(bot, message) {
  bot.startConversation(message, function startConvo(err, convo) {
    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function byeBot(response, convo) {
          convo.say('Bye!');
          convo.next();
          setTimeout(function closeBot() {
            process.exit();
          }, 3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function stayBot(response, convo) {
          convo.say('*Phew!*');
          convo.next();
        }
      }
    ]);
  });
}

function formatUptime(uptime) {
  var unit = 'second';
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'minute';
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'hour';
  }
  if (uptime !== 1) {
    unit = unit + 's';
  }

  uptime = uptime + ' ' + unit;
  return uptime;
}

function uptime(bot, message) {
  var hostname = os.hostname();
  var time = formatUptime(process.uptime());

  bot.reply(message,
    ':robot_face: I am a bot named <@' + bot.identity.name +
    '>. I have been running for ' + time + ' on ' + hostname + '.');
}

module.exports = {
  greet: greet,
  myname: myname,
  sayname: sayname,
  shutdown: shutdown,
  uptime: uptime
};
