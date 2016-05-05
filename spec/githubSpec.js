var chai = require('chai');
var chaiHttp = require('chai-http');
var GitHubApi = require('github');
var expect = chai.expect;

require('dotenv').config();

chai.use(chaiHttp);
// Time between API calls set as such to avoid rate limiting (1 second per message)
function channelHistory(num, timeout) {
  setTimeout(function waitRequest() {
    chai.request('https://slack.com/api/channels.history')
      .get('?token=' + process.env.me + '&channel=' + process.env.channelId
        + '&count=' + num + '&pretty=1')
      .end(function assignText(err, res) {
        if (err) {
          console.log('err ', err);
        } else {
          return res.body.messages;
        }
      });
  }, timeout);
}

function postCommand (command) {
  chai.request('https://slack.com/api/chat.postMessage')
    .post('?token=' + process.env.me + '&channel=' + process.env.channelId)
    // text command
    // username testbot as_user false
}

function responseTest(input, output, done) {
  var text;
  chai.request('https://slack.com/api/chat.postMessage')
    .post('?token=' + process.env.me + '&channel=' + process.env.botDirect
      + '&text=' + input + '&as_user=true&pretty=1')
    .end(function testResponse(err, res) {
      setTimeout(function waitRequest() {
        chai.request('https://slack.com/api/im.history')
          .get('?token=' + process.env.me + '&channel=' + process.env.botDirect
            + '&count=5&pretty=1')
          .end(function assignText(err, res) {
            if (err) {
              console.log('err ', err);
            } else {
              text = res.body.messages[0].text;
            }
          });
      }, 1200);
    });
  setTimeout(function waitCheck() {
    expect(text).to.equal(output);
    done();
  }, 2400);
}

// If a test below fails, increase timeout thresholds to see if it is due to delay.
// Pre-requisites (.env):
// channelId=channelyouwishtotest (https://api.slack.com/methods/channels.list)
// me=authorizationtoken (https://api.slack.com/docs/oauth-test-tokens)
// username=githubusername
// password=githubpassword
// testRepo=repotobetested

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
})

//Repositories
// lists repo
describe('Slash command "show repos"'), function() {
  describe('"/repo [number]"', function () {
    this.timeout(3000);
    it('should list all repositories for "show repos"', function (done) {
      var messages = channelHistory(1, 3000);

      expect(text).to.equal(output);
      done();
    });
    it('should list 2 of the most recent repos on "show 2 repos"', function (done) {
      responseTest('hello', 'Hello.', done);
    });
    it('should list the most recent repository on "show 1 repos" or "show 1 repo"', function (done) {
      responseTest('hello', 'Hello.', done);
    });
    it('should round up arguments that has a decimal place greater than or equal to .5', function (done) {
      responseTest('hello', 'Hello.', done);
    });
    it('should round down arguments that has a decimal place less than .5', function (done) {
      //1.337
      responseTest('hello', 'Hello.', done);
    });
  });

  describe('"help repos"', function () {
    this.timeout(3000);
    it('should show repos help instructions on "help repos"', function (done) {
      responseTest('hello', 'Hello.', done);
    });
    // describe('case insensitive', function () {
    //   it('should show /repo help instructions on "HELP repos"', function (done) {
    //     responseTest('hello', 'Hello.', done);
    //   });
    //   it('should show /repo help instructions on "Help repos"', function (done) {
    //     responseTest('hello', 'Hello.', done);
    //   });
    //   it('should show /repo help instructions on "hElp repos"', function (done) {
    //     responseTest('hello', 'Hello.', done);
    //   });
    //   it('should show /repo help instructions on "HelP repos"', function (done) {
    //     responseTest('hello', 'Hello.', done);
    //   });
    // });
  });

  describe('invalid commands', function () {
    it('should respond with an invalid command message when the argument is not a number', function (done) {
      responseTest('hello', 'Hello.', done);
    });  
    it('should respond with an invalid command message when the argument is a number with white spaces', function (done) {
      responseTest('hello', 'Hello.', done);
    });
  });
}

// watch repo
beforeEach(function() {
  // delete any webhook that is already there
}
// /watch help
// /watch invalid command
//
// unwatches repo
describe('Responds to strings it knows', function () {
  this.timeout(3000);
  it('replies to "hello" with "Hello"', function (done) {
    responseTest('hello', 'Hello.', done);
  });
}
// /unwatch help
// /unwatch invalid command
//
// PR
describe('Responds to strings it knows', function () {
  this.timeout(3000);
  it('replies to "hello" with "Hello"', function (done) {
    responseTest('hello', 'Hello.', done);
  });
}
// notify of new PR
// notify of PR close / merge
// notify of PR in queue
// notify of PR update/synchronize
