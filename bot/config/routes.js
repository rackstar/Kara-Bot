var kara = require('../karabot');
var github = require('../github/github');

function errorLogger(error, req, res, next) {
  // log the error then send it to the next middleware
  console.error(error.stack);
  next(error);
}

function errorHandler(error, req, res, next) {
  // send error message to client
  // message for gracefull error handling on app
  res.status(500).send({ error: error.message });
}

// frontend routes =========================================================
module.exports = function (app) {
  // Github WebHook
  app.post('/github', github.webHookReceiver);
  app.post('/repo', github.getRepo);
  // Error Logger/Handler
  app.use(errorLogger);
  app.use(errorHandler);
};
