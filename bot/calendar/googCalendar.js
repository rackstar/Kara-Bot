var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
// var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
// var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//     process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
var secretsPath = __dirname + '/../../config/';
var TOKEN_DIR = secretsPath;
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

function authCallFunction(cb, reqType) {
  fs.readFile(secretsPath + 'client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API, pass callback to execute on data provided
    if (reqType === 'calendar list') {
      authorize(JSON.parse(content), listCalendars, cb);
    }
    if (reqType === 'days events') {
      authorize(JSON.parse(content), listEvents, cb);  
    }
  });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, cb) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, cb);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, cb) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    // calendarId: 'primary',
    calendarId: '62ao9jj5es0se62blotv8p5up0@group.calendar.google.com',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    console.log(events);
    if (events.length === 0) {
      console.log('No upcoming events found.');
    } else {
      var todayDate = ((new Date()).toISOString()).slice(0, 10)
      console.log('Upcoming 10 events:');
      var cData = '*' + events[0].organizer.displayName + '*```';
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        if (start.slice(0, 10) === todayDate) {
          if (start.length > 10) {
            cData += dmzTime(start.slice(11, 16)) + ' to ' + dmzTime(event.end.dateTime.slice(11, 16), true) + '\n';
          } else {
            cData += '* All Day Event *\n';
          }
          if (event.summary) {
            cData += '  ' + event.summary;
            if (event.location) {
              cData += ' --> ' + event.location;
            }
            cData += '\n';
          }
        }
      }
      cb(cData + '```');
    }
  });
}

function listCalendars(auth, cb) {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({
    auth: auth,
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length === 0) {
      console.log('No calendars were found.');
    } else {
      var cData = '*' + events.length + ' calendars found*\n```';
      for (var i = 0; i < events.length; i++) {
        cData += '     id:' + events[i].id + '\n';
        cData += 'summary:' + events[i].summary;
        if (i + 1 < events.length) {
          cData += '\n-------------------------------------\n';
        }
      }
      cData += '```';
      cb(cData);
    }
  });
}

function dmzTime(dmzString, noLeadSpace) {
  var hour = Number(dmzString.slice(0, 2));
  hour -= hour > 12 ? 12 : 0;
  return ((noLeadSpace ? '' : ' ') + hour).slice(-2) + dmzString.slice(-3);
}

module.exports = {
  authCallFunction: authCallFunction,
};
