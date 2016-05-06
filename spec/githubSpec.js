var chai = require('chai');
var chaiHttp = require('chai-http');
var GitHubApi = require('github');
var expect = chai.expect;
var command;
var output;
var repo = process.env.testrepo;

require('dotenv')
  .config();

channel = process.env.channelId;
botDirect = process.env.botDirect;

chai.use(chaiHttp);

function responseTest(input, output, done) {
  var text;
  chai.request('https://slack.com/api/chat.postMessage')
    .post('?token=' + process.env.me + '&channel=%40karabot&text=' + input + '&as_user=true&pretty=1')
    .end(function testResponse(err, res) {
      setTimeout(function waitRequest() {
        chai.request('https://slack.com/api/im.history')
          .get('?token=' + process.env.me + '&channel=' + process.env.botDirect + '&count=5&pretty=1')
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
    expect(text)
      .to.equal(output);
    done();
  }, 2400);
}

function channelHistory(output, done) {
  var text;
  setTimeout(function waitRequestCH() {
    chai.request('https://slack.com/api/im.history')
      .get('?token=' + process.env.me + '&channel=' + process.env.botDirect + '&count=5&pretty=1')
      .end(function assignText(err, res) {
        if (err) {
          console.log('err ', err);
        } else {
          // change text to check more than the first message
          text = res.body.messages[0].text;
        }
      });
  }, 1200);
  setTimeout(function waitCheckCH() {
    expect(text)
      .to.equal(output);
    done();
  }, 2400);
}
// If a test below fails, increase timeout thresholds to see if it is due to delay.
// Pre-requisites (.env):
// channelId=channelyouwishtotest (https://api.slack.com/methods/channels.list)
// me=authorizationtoken (https://api.slack.com/docs/oauth-test-tokens)
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
  describe('"show repo [number]"', function() {
    it('should list all repositories for "show repos"', function(done) {
      command = 'show repos';
      output = '';
      responseTest(command, output, done);
    });
    it('should list all repositories for "repos"', function(done) {
      command = 'repos';
      output = '';
      responseTest(command, output, done);
    });
    it('should list 2 of the most recent repos on "show 2 repos"', function(done) {
      command = 'show 2 repos';
      output = '';
      responseTest(command, output, done);
    });
    it('should list the most recent repository on "show 1 repos" or "show 1 repo"', function(done) {
      command = 'show 1 repos';
      output = '';
      responseTest(command, output, done);
      command = 'show 1 repo';
      responseTest(command, output, done);
    });
    it('should round up arguments that has a decimal place greater than or equal to .5', function(done) {
      command = 'show 1.793 repos';
      output = '';
      responseTest(command, output, done);
    });
    it('should round down arguments that has a decimal place less than .5', function(done) {
      command = 'show 1.337 repos';
      output = '';
      responseTest(command, output, done);
    });
  });

  describe('"help repos"', function() {
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

  describe.skip('invalid commands', function() {
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
describe('watch repo', function() {
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
describe('unwatch', function() {
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
