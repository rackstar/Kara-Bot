var pg = require('pg');

var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/karabot';

exports.select = function select(cb, table, column, value, property) {
  var data = [];

  pg.connect(connectionString, function pgSelect(err, client, done) {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
    }

    // "SELECT * FROM table WHERE column = 'value'"
    var query = client.query("SELECT * FROM " + table +
                             " WHERE " + column + "='" +
                             value + "'");

    query.on('row', function(row) {
      if (property) {
        row = row[property];
      }
      data.push(row);
    });

    query.on('end', function() {
      done();
      // callback on data
      cb(data);
    });
  });
};
