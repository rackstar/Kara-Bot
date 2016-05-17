var kara = require('../karabot.js');
var unirest = require('unirest');

function getWeather(bot, message, cb) {
  //get location
  var location = message.match[1];
  console.log('LOCATION', location);
  var key = process.env.weatherKey;
  var weatherUrl = 'http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&units=imperial&APPID=' + process.env.weatherKey;
  unirest.get(weatherUrl, function(data){
    cb(data.body);
  });
}

function getDaysWeatherData(data, day) {
  var start = day * 8;
  var weatherData = {
    high: -200,
    low: 200,
    rain: false,
    rainStart: null,
    rainTotal: 0,
    snow: false,
    snowStart: null,
    snowTotal: 0,
    mainCondition: data.list[start + 4].weather[0].main,
    condition: data.list[start + 4].weather[0].description
  }
  for(var i = start; i < start + 8; i++){
    var d = new Date(data.list[i].dt_txt);
    if(data.list[i].main.temp_max > weatherData.high){
      weatherData.high = data.list[i].main.temp_max;
    }
    if(data.list[i].main.temp_min < weatherData.low){
      weatherData.low = data.list[i].main.temp_min;
    }
    if(data.list[i].rain && data.list[i].rain['3h']){
      if(!weatherData.rainStart){
        weatherData.rain = true;
        weatherData.rainStart = d.toLocaleTimeString();
      }
      weatherData.rainTotal += data.list[i].rain['3h'];
    }
    if(data.list[i].snow){
      if(!weatherData.snowStart){
        weatherData.snow = true;
        weatherData.snowStart = d.toLocaleTimeString();
      }
      weatherData.snowTotal += data.list[i].snow['3h'];
    }
  }
  weatherData.high = weatherData.high.toFixed(1);
  weatherData.low = weatherData.low.toFixed(1);
  weatherData.rainTotal = weatherData.rainTotal.toFixed(2);
  weatherData.snowTotal = weatherData.snowTotal.toFixed(2);
  // console.log(weatherData);
  return weatherData;
}

function constructMessageFields(data){
  var fields = [
    {
      title: 'High',
      value: '' + data.high + ' F',
      short: false 
    },
    {
      title: 'Low',
      value: '' + data.low + ' F',
      short: false 
    }
  ];
  if(data.rain){
    fields.push({
      title: 'Rain',
      value: data.rainTotal + 'mm',
      short: false
    },
    {
      title: 'Rain will start around ' + data.rainStart,
      value: '',
      short: false
    });
  } else if(data.snow){
    fields.push({
      title: 'Snow',
      value: data.snowTotal + 'mm',
      short: false
    },
    {
      title: 'Snow will start around ' + data.snowStart,
      value: '',
      short: false
    });
  } else {
    fields.push({
      title: 'No precipitation',
      value: '',
      short: false
    })
  }
  return fields;
}

function constructResponse(data, date, location){
  var formattedDate = date.toLocaleDateString();
  //icons to match data.main condition
  var weatherIcons = {
    Clear: ':sunny:',
    Clouds: ':cloud:',
    Snow: ':snowflake',
    Rain: ':droplet:',
    Atmosphere: ':fog:',
    Drizzle: ':droplet:'
  }
  //weather colors from cool to hot (blue, green, yellow, orange, red)
  weatherColors = ['#00AEDB', '#00B159', '#FFC425', '#F37735', '#D11141']
  var averageTemp = (parseInt(data.high) + parseInt(data.low)) / 2;
  //Select message edge color based on average temp
  var messageColor;
  if(averageTemp <= 40){
    messageColor = weatherColors[0]
  } else if(averageTemp <= 55) {
    messageColor = weatherColors[1]
  } else if(averageTemp <= 70) {
    messageColor = weatherColors[2]
  } else if(averageTemp <= 85) {
    messageColor = weatherColors[3]
  } else {
    messageColor = weatherColors[4]
  }

  var botResponse = {
    attachments: [
      {
        fallback: 'here is the weather',
        color: messageColor,
        pretext: 'Weather for ' + formattedDate + ' in ' + location +
          '\n ' + weatherIcons[data.mainCondition] + ' *' + data.condition + '* ' + weatherIcons[data.mainCondition],
        fields: constructMessageFields(data),
        mrkdwn_in: ['pretext']
      }
    ],
  };
  return botResponse;
}

function getTodayWeather(bot, message) {
  getWeather(bot, message, function(data) {
    var location = data.city.name;
    var date = new Date(data.list[0].dt_txt)
    var weatherInfo = getDaysWeatherData(data, 0);
    var response = constructResponse(weatherInfo, date, location);
    bot.reply(message, response);
  });
}

function getTomorrowWeather(bot, message) {
  getWeather(bot, message, function(data) {
    var location = data.city.name;
    var date = new Date(data.list[8].dt_txt)
    var weatherInfo = getDaysWeatherData(data, 1);
    var response = constructResponse(weatherInfo, date, location);
    bot.reply(message, response);
  });
}

function getFourDayForecast(bot, message){
  getWeather(bot, message, function(data) {
    var location = data.city.name;
    var date = new Date(data.list[0].dt_txt)
    var weatherInfo = getDaysWeatherData(data, 0);
    var response = constructResponse(weatherInfo, date, location);
    for(var i = 1; i < 4; i++){
      date = new Date(data.list[i*8].dt_txt)
      var tempWeatherInfo = getDaysWeatherData(data, i);
      console.log('TEMP INFO', tempWeatherInfo)
      var tempResponse = constructResponse(tempWeatherInfo, date, location);
      response.attachments.push(tempResponse.attachments[0]);
    }
    bot.reply(message, response);
  });
}

module.exports = {
  getTodayWeather: getTodayWeather,
  getTomorrowWeather: getTomorrowWeather,
  getFourDayForecast: getFourDayForecast
}