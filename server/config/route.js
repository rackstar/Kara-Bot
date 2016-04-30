var github = require('../github');

function errorLogger(error, req, res, next) {
  // log the error then send it to the next middleware in
  console.error(error.stack);
  next(error);
}

function errorHandler(error, req, res, next) {
  // send error message to client
  // message for gracefull error handling on app
  res.status(500).send({ error: error.message });
}

module.exports = function route(app) {
  app.post('/', github.webHookReceiver);
  app.use(errorLogger);
  app.use(errorHandler);
};
