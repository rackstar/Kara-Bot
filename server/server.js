var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

// middleware and routing configuration
require('./config/middleware.js')(app, express);
require('./config/route.js')(app);

app.listen(port);
console.log('Server is running on ' + port);
