var morgan = require('morgan');
var bodyParser = require('body-parser');

module.exports = function middleware(app, express) {
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../../client'));
};
