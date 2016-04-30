var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
var testName = 'Foo';

require('dotenv').config();

chai.use(chaiHttp);


// Tests built utilizing Slack API calls to see if bot responds with expected response.
// If a test below fails, increase timeout thresholds to see if it is due to delay.
// Must get personal test token at https://api.slack.com/docs/oauth-test-tokens and set
// me=thetokenyoureceive in the .env file.
describe('Responds to strings it knows', function () {
  it('replies to "hello" with "Hello"', function (done) {
    var text;
    setTimeout(function () {
      expect(text).to.be.a('string');
      expect(text).to.have.string('Hello');
      done();
    }, 1500);
    chai.request('https://slack.com/api/chat.postMessage')
      .post('?token=' + process.env.me + '&channel=' + process.env.botDirect
        + '&text=hello&as_user=true&pretty=1')
      .end(function (err, res) {
        setTimeout(function () {
          chai.request('https://slack.com/api/im.history')
            .get('?token=' + process.env.me + '&channel=' + process.env.botDirect
              + '&count=5&pretty=1')
            .end(function (err, res) {
              if (err) {
                console.log('err ', err);
              } else {
                text = res.body.messages[0].text;
              }
            });
        }, 750);
      });
  });
});

describe('Does not respond to unrecognized strings', function () {
  it('does not reply to "jello"', function (done) {
    var text;
    setTimeout(function () {
      expect(text).to.be.a('string');
      expect(text).to.equal('jello');
      done();
    }, 1500);
    chai.request('https://slack.com/api/chat.postMessage')
      .post('?token=' + process.env.me + '&channel=' + process.env.botDirect
        + '&text=jello&as_user=true&pretty=1')
      .end(function (err, res) {
        setTimeout(function () {
          chai.request('https://slack.com/api/im.history')
            .get('?token=' + process.env.me + '&channel=' + process.env.botDirect
              + '&count=5&pretty=1')
            .end(function (err, res) {
              if (err) {
                console.log('err ', err);
              } else {
                text = res.body.messages[0].text;
              }
            });
        }, 750);
      });
  });
});
