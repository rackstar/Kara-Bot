var kara = require('../karabot.js');
var unirest = require('unirest');

function getWeather(bot, message, cb) {
  //get zip code
  var splitMessage = message.text.split(' ');
  location = splitMessage[splitMessage.length - 1];
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
    // console.log(data.list[i]);
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
  return weatherData;
}

function constructResponse(data, date, location){
  var formattedDate = date.toLocaleDateString();
  var weatherIcons = {
    Clear: ':sunny:',
    Clouds: ':cloud:',
    Snow: ':snowflake',
    Rain: ':droplet:',
    Atmosphere: ':fog:',
    Drizzle: ':droplet:'
  }
  var botResponse = {
    attachments: [
      {
        fallback: 'here is the weather',
        color: 'blue',
        pretext: 'Weather for ' + formattedDate + ' in ' + location,
        author_name: data.condition,
        fields: [
          {
            title: 'High',
            value: '' + data.high + ' F',
            short: false
          },
          {
            title: 'Low',
            value: '' + data.low + ' F',
            short: false
          },
          {
            title: 'Precipitation',
            value: '' + data.rainTotal + ' mm',
            short: false
          },
        ]
      }
    ]
  }
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
    var date = new Date(data.list[0].dt_txt)
    var weatherInfo = getDaysWeatherData(data, 1);
    var response = constructResponse(weatherInfo, date, location);
    bot.reply(message, response);
  });
}

module.exports = {
  getTodayWeather: getTodayWeather,
  getTomorrowWeather: getTomorrowWeather
}