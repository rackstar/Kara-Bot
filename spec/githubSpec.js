var chai = require('chai');
var chaiHttp = require('chai-http');
var GitHubApi = require('github');
var expect = chai.expect;
var messages;
var botDirect;
var botId;
var output;
var repo;

require('dotenv')
  .config();

repo = process.env.testrepo;
botDirect = process.env.botDirect;
botId = process.env.botId;

chai.use(chaiHttp);

function sendCommand(input) {
  chai.request('https://slack.com/api/chat.postMessage')
    .post('?token=' + process.env.me + '&channel=' + botDirect + '&text=' + input + '&as_user=true&pretty=1')
    .end(function sendCommandCb(err, res) {
      if (err) console.log(err);
    });
}

function channelHistory(count, cb) {
  var messages;
  // setTimeout(function CHtimeout() {
  chai.request('https://slack.com/api/im.history')
    .get('?token=' + process.env.me + '&channel=' + botDirect + '&count=' + count + '&pretty=1')
    .end(function assignText(err, res) {
      if (err) {
        console.log(err);
      } else {
        messages = res.body.messages;
        // filter response messages of the bot
        messages = messages.filter(function(message) {
          return message.user === botId;
        });
      }
    });
  return messages;
}

function findResponse(messages, expectation) {
  var botResponse = messages.find(function(message) {
    return message.text === expectation;
  });
  expect(botResponse.text)
    .to.equal(expectation);
}

// If a test below fails, increase timeout thresholds to see if it is due to delay.
// Pre-requisites (.env):
// me=authorizationtoken (https://api.slack.com/docs/oauth-test-tokens)
// botId=idofyourbot (https://api.slack.com/methods/users.list/test)
// channelId=botsdirectmessagechannel (https://api.slack.com/methods/im.list/test)
// use bot's Id to find its direct message channel with you
// username=githubusername
// password=githubpassword
// testRepo=<githubusername>/<repotobetested>

beforeEach(function githubSetup() {
  var github = new GitHubApi({
    version: '3.0.0',
    debug: true,
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000,
    headers: {
      'user-agent': 'Kara-Bot'
    }
  });
  github.authenticate({
    type: 'basic',
    username: process.env.username,
    password: process.env.password
  });
});

//Repositories
// lists repo
describe('Lists Repos', function() {
  xdescribe('"show <number> repo"', function() {
    var botMsg;
    var count = 9;
    // sendCommand('show repos');
    // sendCommand('show 2 repos');
    // sendCommand('show 1 repos');

    setTimeout(function timeout1() {
      chai.request('https://slack.com/api/im.history')
        .get('?token=' + process.env.me + '&channel=' + botDirect + '&count=' + count + '&pretty=1')
        .end(function assignText(err, res) {
          if (err) {
            console.log(err);
          } else {
            messages = res.body.messages;
            // filter response messages of the bot
            botMsg = messages.filter(function(message) {
              return message.user === botId;
            });
          }
        });
    }, 3000);

    xit('should list all repositories for "show repos"', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here are all your current repositories:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
    xit('should list 2 of the most recent repos on "show 2 repos"', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here are your 2 most recent repositories:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
    xit('should list the most recent repository on "show 1 repos"', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here is your most recent repository:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
  });

  describe('"other passable repo instructions"', function() {
    var botMsg;
    var count = 9;

    sendCommand('repos');
    sendCommand('show 1.793 repos');
    sendCommand('show 1.337 repos');

    setTimeout(function timeout1() {
      chai.request('https://slack.com/api/im.history')
        .get('?token=' + process.env.me + '&channel=' + botDirect + '&count=' + count + '&pretty=1')
        .end(function assignText(err, res) {
          if (err) {
            console.log(err);
          } else {
            messages = res.body.messages;
            // filter response messages of the bot
            botMsg = messages.filter(function(message) {
              return message.user === botId;
            });
          }
        });
    }, 3000);

    it('should list all repositories for "repos"', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here are all your current repositories:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
    it('should round up numbers that has a decimal place greater than or equal to .5', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here are your 2 most recent repositories:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
    it('should round down numbers that has a decimal place less than .5', function(done) {
      this.timeout(4000);
      setTimeout(function timeout2() {
        output = 'Here is your most recent repository:';
        findResponse(botMsg, output);
      }, 4000);
      setTimeout(done, 2000);
    });
  });


  xdescribe('"help repos"', function() {
    it('should show repos instructions on "help repos"', function(done) {
      command = 'help repos';
      output = 'How to use show repo';
      responseTest(command, output, done);
    });
    describe.skip('case insensitive', function() {
      it('should show /repo help instructions on "HELP repos"', function(done) {
        command = 'show repos';
        output = '';
        responseTest(command, output, done);
      });
      it('should show /repo help instructions on "Help repos"', function(done) {
        command = 'show repos';
        output = '';
        responseTest(command, output, done);
      });
      it('should show /repo help instructions on "hElp repos"', function(done) {
        command = 'show repos';
        output = '';
        responseTest(command, output, done);
      });
      it('should show /repo help instructions on "HelP repos"', function(done) {
        command = 'show repos';
        output = '';
        responseTest(command, output, done);
      });
    });
  });

  xdescribe('invalid commands', function() {
    it('should respond with an invalid command message when the argument is not a number', function(done) {
      command = 'show apo repos';
      output = 'invalid command, please check /repo help';
      responseTest(command, output, done);
    });
    it('should respond with "show <number> repos" when third argument is the number', function(done) {
      command = 'show repos 5';
      output = '';
      responseTest(command, output, done);
    });
  });
});

// watch repo
describe.skip('watch repo', function() {
  beforeEach(function() {
    // delete any webhook that is already there
  });
  describe('response', function() {
    it('should reply with appropriate responses if successful', function(done) {
      command = 'watch repo ' + repo;
      output = 'BeepBop.. Targeting repo.'
      var output2 = 'I am now watching ' + req.body.text + '\'s every move';
      responseTest(command, output, done);
    });
  });
  describe('Repo Events', function() {
    it('should notify of new pull requests submission', function(done) {
      // github create 1 request
      output = '';
      channelHistory(output, done);
    });
    it('should notify of pull request closure', function(done) {
      // close PR
      // check 2nd to last message
      output = '';
      channelHistory(output, done);
    });
    it('should notify of merged pull request and its commits', function(done) {
      // same as above but testing for the last message
      channelHistory(output, done);
    });
    it('should detect other pull requests in the queue and send notification to update them', function(done) {
      // create 2 PR
      // close down 1
      // check last message
      output = 'needs to be updated';
      channelHistory(output, done);
    });
    it('should notify when pull requests in queue are updated', function(done) {
      // update remaining PR
      // check last message
      output = 'has been updated';
      channelHistory(output, done);
    });
  });
  describe('watch commands', function() {
    it('should show watch instructions when on "help watch" or "watch"', function(done) {
      command = 'help watch';
      output = '';
      responseTest(command, output, done);
      command = 'watch';
      responseTest(command, output, done);
    });
    it('should respond with "please provide <username>/<repo> on invalid commands', function(done) {
      command = 'watch invalidrepo';
      output = '';
      responseTest(command, output, done);
    });
    //conversation
    // please provide <username>/<repo>
    // I can list all your current repos if you want?
    // yes. -lists repo
    xit('should respond with "please provide <username>/<repo>" on invalid command, i can list your repositories of you', function(done) {
      command = 'watch';
      output = '';
      responseTest(command, output, done);
    });
  });
});

// unwatches repo
xdescribe('unwatch', function() {
  beforeEach(function() {
    // verify webhook is working
    // if working continue
    // if not create webhook
    // send PR verify its working
  });

  it('should stop sending notification on unwatch', function(done) {
    // unwatch command
    // send PR
    // verify that it there is no notification
    command = 'unwatch ' + repo;
    output = ''; // no notification
    responseTest(command, output, done);
  });
  it('should show unwatch instructions on "help unwatch" or "unwatch"', function(done) {
    command = 'help unwatch';
    output = ''; // unwatch instructions
    responseTest(command, output, done);
  });
  it('should respond with "please provide <username>/<repo> on invalid commands', function(done) {
    command = 'unwatch';
    output = '';
    responseTest(command, output, done);
    command = 'unwatch invalidrepo';
    output = '';
    responseTest(command, output, done);
  });
  //conversation
  // please provide <username>/<repo>
  // I can list all your current repos if you want?
  // yes. -lists repo
  xit('should respond with "please provide <username>/<repo>" on invalid command, i can list your repositories of you', function(done) {
    command = 'watch';
    output = '';
    responseTest(command, output, done);
  });
});

// DO everything again but in direct message
