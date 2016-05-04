var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var testName = 'Foo';

require('dotenv').config();

chai.use(chaiHttp);
// Time between API calls set as such to avoid rate limiting (1 second per message)
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


// Tests built utilizing Slack API calls to see if bot responds with expected response.
// If a test below fails, increase timeout thresholds to see if it is due to delay.
// Must get personal test token at https://api.slack.com/docs/oauth-test-tokens and set
// me=thetokenyoureceive in the .env file.
describe('Responds to strings it knows', function () {
  this.timeout(3000);
  it('replies to "hello" with "Hello"', function (done) {
    responseTest('hello', 'Hello.', done);
  });

  it('can store a name', function (done) {
    responseTest(('my name is ' + testName), ('Got it. I will call you ' + testName
      + ' from now on.'), done);
  });

  it('will include stored name in reply', function (done) {
    responseTest('hello', ('Hello ' + testName + '!!'), done);
  });

  it('replies to "life the universe and everything" with "42"', function (done) {
    responseTest('life, the universe and everything', '42', done);
  });

  it('replies to "master code" with THE code', function (done) {
    responseTest('master code', ('↑ ↑ ↓ ↓ ← → ← → Ⓑ Ⓐ START'), done);
  });
});

describe('Does not respond to unrecognized strings', function () {
  this.timeout(3000);
  it('does not reply to "jello"', function (done) {
    responseTest('jello', 'jello', done);
  });
});
