import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Faux from 'react-faux-dom';
import D3 from 'D3';

export default class Chart extends Component {
    
  componentWillMount() {
    
    this.setState({ready:false});
    
    console.log('####### Entering ########')
    var currentThis = this;
    this.d3Data = this.getWatsonData(currentThis.resultsBack.bind(currentThis));
    console.log(this.d3Data)
    console.log('######## exiting ##########')
    // this.resultsBack();
  }
  
  resultsBack() {
    this.setState({ready:true});
  }
  
  getWatsonData(callback) {

   var settings = {
    "async": true,
    "crossDomain": true,
    "url": "/api/watson/channel",
    "method": "POST",
    "headers": {
      "cache-control": "no-cache",
      "postman-token": "c5a32e6d-7f64-5eaa-d435-50d5af557090",
      "content-type": "application/x-www-form-urlencoded"
    },
    "data": {
      "channel": "C155RNX46"
    }
  }
  
  // var x = $.ajax(settings).done(function (response,callback) {
  var x = $.ajax(settings).done(function () {
    callback();
  });
      var json = {"Social Tone":{"Openness":.079,"Conscientiousness":.560,"Extraversion":.951,"Agreeableness":.763,"Emotional Range":.375}}
      var data = processData(json);
      return data;
  }

  render() {
    if (this.state.ready) {
      
    var fauxElement = Faux.createElement("div");
    
    var diameter = 800, //max size of the bubbles
      color = d3.scale.category20b(); //color category
    
    var bubble = d3.layout.pack()
      .sort(null)
      .size([diameter, diameter])
      .padding(10);
    
    var svg = d3.select(fauxElement)
      .append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");
    
    var json = {"Social Tone":{"Openness":.079,"Conscientiousness":.560,"Extraversion":.951,"Agreeableness":.763,"Emotional Range":.375}}
    
    //bubbles needs very specific format, convert data to this.
    // var data = processData(json);

    var nodes = bubble.nodes({children:this.d3Data}).filter(function(d) { return !d.children; });

    //setup the chart
    var bubbles = svg.append("g")
      .attr("transform", "translate(0,0)")
      .selectAll(".bubble")
      .data(nodes)
      .enter();

    //create the bubbles
    bubbles.append("circle")
      .attr("r", function(d){ return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) { return color(d.value); });

    //format the text for each bubble
    bubbles.append("text")
      .attr("x", function(d){ return d.x; })
      .attr("y", function(d){ return d.y + 5; })
      .attr("text-anchor", "middle")
      .text(function(d){ return d["name"]; })
      .style({
          "fill":"white", 
          "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
          "font-size": "12px"
      });

    return (
      <div>
        {fauxElement.toReact()}
      </div>
    );
  } else {
    return (
      <h3>
        Loading chart...
      </h3>
    );
  }
  
  }
}
  
function processData(data) {
  var obj = data[Object.keys(data)[0]];

  var newDataSet = [];

  for(var key in obj) {
    newDataSet.push({name: key, value: obj[key]});
  }
  return newDataSet;
}

// function getWatsonData(callback) {

//    var settings = {
//     "async": true,
//     "crossDomain": true,
//     "url": "/api/watson/channel",
//     "method": "POST",
//     "headers": {
//       "cache-control": "no-cache",
//       "postman-token": "c5a32e6d-7f64-5eaa-d435-50d5af557090",
//       "content-type": "application/x-www-form-urlencoded"
//     },
//     "data": {
//       "channel": "C155RNX46"
//     }
//   }
  
//   // var x = $.ajax(settings).done(function (response,callback) {
//   var x = $.ajax(settings).done(function (callback) {
//     callback();
//   });
//       var json = {"Social Tone":{"Openness":.079,"Conscientiousness":.560,"Extraversion":.951,"Agreeableness":.763,"Emotional Range":.375}}
//       var data = processData(json);
//       return data;
// }








