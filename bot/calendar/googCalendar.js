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
// var secretsPath = __dirname + '/../../config/';
// var TOKEN_DIR = secretsPath;
// var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

function authCallFunction(cb, reqType, param1, param2) {
  // Refactor to .ENV pass-in of Calendar API key, instead of loading from disk:
  // fs.readFile(secretsPath + 'client_secret.json', function processClientSecrets(err, content) {
  //   if (err) {
  //     console.log('Error loading client secret file: ' + err);
  //     return;
  //   }
  if (!process.env.googleCalAPIKey) {
    console.log('Error loading client secret file: process.env.googleCalAPIKey is undefined');
    cb(':anguished: Darn! The API key is `undefined`');
    return;
  }

  var content = process.env.googleCalAPIKey;
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API, pass callback to execute on data provided
  if (reqType === 'calendar list') {
    authorize(JSON.parse(content), listCalendars, cb);
  }
  if (reqType === 'days events') {
    authorize(JSON.parse(content), listEvents, cb, param1, param2);
  }
  if (reqType === 'free slots') {
    authorize(JSON.parse(content), listFreeSlots, cb, param1, param2);
  }
  if (reqType === 'insert event') {
    authorize(JSON.parse(content), insertEvent, cb, param1, param2);
  }
  // });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, cb, param1, param2) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Refactor to .ENV pass-in of OAuth2 key, instead of loading from disk:
  // Check if we have previously stored a token.
  // fs.readFile(TOKEN_PATH, function (err, token) {
    // if (err) {
      // getNewToken(oauth2Client, callback);
    // } else {
      // oauth2Client.credentials = JSON.parse(token);
      // callback(oauth2Client, cb);
    // }
  // });

  // Refactor this to actually retrieve new key as above
  if (!process.env.googleCalToken) {
    console.log('Error loading OAuth2 token: process.env.googleCalToken is undefined');
    cb(':anguished: Darn! The auth token is `undefined`');
    return;
  }
  oauth2Client.credentials = JSON.parse(process.env.googleCalToken);
  callback(oauth2Client, cb, param1, param2);
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
 * Lists the next 20 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, cb, param1, param2) {
  var calendar = google.calendar('v3');
  var cData = ''; // Our return data, declare here for use in later branches
  var maxDate = new Date(param1);
  maxDate.setHours(24, 0, 0, 0); // setHours returns numeric value, must do 2 step process
  calendar.events.list({
    auth: auth,
    // calendarId: 'primary',
    calendarId: '62ao9jj5es0se62blotv8p5up0@group.calendar.google.com',
    timeMin: param1.toISOString(), // Google takes into account the time zone difference!!
    timeMax: maxDate.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      cData = ':anguished: Darn! The API returned an error with that option';
      cb(cData);
      return;
    }
    var events = response.items;
    console.log(events);
    if (events.length === 0) {
      console.log('No upcoming events found.');
      cData = '*' + 'KaraBot Sub Calendar' + '*```' + param1.toString().slice(0, 10) + '\n';
      cData += ' no events found```';
      cb(cData);
    } else {
      // Fun with JavaScript dates, ISO will roll date forward by time zone offset, so roll hours back
      // by number of hours of time zone offset first, then create ISO string
      var ISODate = new Date(param1);
      ISODate.setHours(ISODate.getHours() - (ISODate.getTimezoneOffset() / 60)); // setHours returns numeric value!
      ISODate = ISODate.toISOString().slice(0, 10);
      console.log('Upcoming 20 events:');
      cData = '*' + events[0].organizer.displayName + '*```' + param1.toString().slice(0, 10) + '\n';
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        var end = event.end.dateTime || event.end.date;
        if (start.slice(0, 10) === ISODate || end.slice(0, 10) === ISODate) {
          if (start.length > 10 || end.length > 10) {
            cData += dmzTime(start.slice(11, 16)) + ' to ' + dmzTime(end.slice(11, 16), true);
            if (start.slice(0, 10) !== ISODate) {
              cData += ' (starts day before)';
            }
            cData += '\n';
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

function listFreeSlots(auth, cb, param1, param2) {
  var calendar = google.calendar('v3');
  var cData = ''; // Our return data, declare here for use in later branches
  var maxDate = new Date(param1);
  maxDate.setHours(24, 0, 0, 0); // setHours returns numeric value, must do 2 step process
  calendar.events.list({
    auth: auth,
    // calendarId: 'primary',
    calendarId: '62ao9jj5es0se62blotv8p5up0@group.calendar.google.com',
    timeMin: param1.toISOString(), // Google takes into account the time zone difference!!
    timeMax: maxDate.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      cData = ':anguished: Darn! The API returned an error with that option';
      cb(cData);
      return;
    }
    var events = response.items;
    console.log(events);
    if (events.length === 0) {
      console.log('No upcoming events found.');
      cData = '*' + 'KaraBot Sub Calendar' + '*``' + param1.toString().slice(0, 10) + '\n';
      cData += ' no events found```';
      cb(cData);
    } else {
      // Fun with JavaScript dates, ISO will roll date forward by time zone offset, so roll hours back
      // by number of hours of time zone offset first, then create ISO string
      var ISODate = new Date(param1);
      ISODate.setHours(ISODate.getHours() - (ISODate.getTimezoneOffset() / 60)); // setHours returns numeric value!
      ISODate = ISODate.toISOString().slice(0, 10);
      var curTime = new Date(param1).toTimeString().slice(0, 5);
      var allDayEvent = false;
      console.log('Upcoming 20 events:');
      cData = '*' + events[0].organizer.displayName + '* \n```' + param1.toString().slice(0, 10) + '```\n';
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        var end = event.end.dateTime || event.end.date;
        if (start.slice(0, 10) === ISODate || end.slice(0, 10) === ISODate) {
          if (start.length > 10 || end.length > 10) {
            if (!allDayEvent && curTime < start.slice(11, 16)) {
              cData += '`' + dmzTime(curTime, true) + ' to ' + dmzTime(start.slice(11, 16), true) + ' free slot`\n';
            }
            curTime = end.slice(11, 16);
            cData += dmzTime(start.slice(11, 16)) + ' to ' + dmzTime(end.slice(11, 16), true);
            if (start.slice(0, 10) !== ISODate) {
              cData += ' (starts day before)';
            }
          } else {
            cData += '* All Day Event *\n';
            allDayEvent = true;
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
      if (curTime < '24:00' && !allDayEvent && end.length > 10 && end.slice(11, 16) !== '00:00') {
        cData += '`' + dmzTime(curTime, true) + ' to ' + dmzTime('00:00', true) + ' free slot`\n';
      }
      cb(cData);
    }
  });
}

function listCalendars(auth, cb) {
  var calendar = google.calendar('v3');
  var cData = ''; // Our return data, declare here for use in later branches
  calendar.calendarList.list({
    auth: auth
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      cData = ':anguished: Darn! The API returned an error with that option';
      cb(cData);
      return;
    }
    var events = response.items;
    if (events.length === 0) {
      console.log('No calendars were found.');
    } else {
      cData = '*' + events.length + ' calendars found*\n```';
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

function insertEvent(auth, cb, param1, param2) {
  var calendar = google.calendar('v3');
  var cData = ''; // Our return data, declare here for use in later branches
  calendar.events.insert(
    {
      auth: auth,
      calendarId: '62ao9jj5es0se62blotv8p5up0@group.calendar.google.com',
      resource:
        {
          start:
            {
              dateTime: param1.start
            },
          end:
            {
              dateTime: param1.end
            },
          summary: param1.summary,
          location: param1.location
        }
    },
    function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        cData = ':anguished: Darn! The API returned an error with that option';
        cb(cData);
        return;
      }
      cb('_event has been added_');
    });
}

function dmzTime(dmzString, noLeadSpace) {
  var hour = Number(dmzString.slice(0, 2));
  var ap = hour > 11 ? 'p' : 'a';
  hour -= hour > 12 ? 12 : 0;
  hour = hour > 0 ? hour : 12;
  return ((noLeadSpace ? '' : ' ') + hour).slice(-2) + dmzString.slice(-3) + ap;
}

module.exports = {
  authCallFunction: authCallFunction
};
