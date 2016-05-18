import React, { Component } from 'react';
import { Carousel, Collapse, Button, Jumbotron, Image } from 'react-bootstrap';

export default class Home extends Component {
  componentWillMount() {
    this.setState({open:false});
  }

  render() {
    return (
      <div>
        <Jumbotron>
          <h1>Welcome to KaraBot!</h1>
          <h3>A Slack Bot to assist with your engineering team's workflow!</h3>
          <p>Let KaraBot help your Engineering team by letting you know when a Pull Request was submitted or merged in
          GitHub, notifying you when a highest priority issue was submitted in JIRA, keeping track of you team's Google
          Calendar, or even just letting you know what the weather is going to be for the next few days!</p>
          <Button bsStyle="info" onClick={ ()=> this.setState({ open: !this.state.open })}>
            Learn More
          </Button>
          <a href="https://slack.com/oauth/authorize?scope=bot,channels:read,channels:history,users:read&client_id=38425829201.43206739334&state=random123" style={{marginLeft: 5}}>
            <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
          </a>
        </Jumbotron>
        <Collapse in={this.state.open}>
          <div style={{width:'auto', height:600, margin:'0 auto'}}>
            <Carousel interval={18000}>
              <Carousel.Item>
                <Image style={{width:'auto', height:600, margin:'0 auto'}} src="../style/images/github.gif"/>
                <Carousel.Caption style={{color:'black'}}>
                  <h3>GitHub</h3>
                  <p>Keep track of incoming and merged Pull Requests.</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Image style={{width:'auto', height:600, margin:'0 auto'}} src="../style/images/jira.gif"/>
                <Carousel.Caption style={{color:'black'}}>
                  <h3>JIRA</h3>
                  <p>Get notified when critical issues are submitted.</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Image style={{width:'auto', height:600, margin:'0 auto'}} src="../style/images/calendar.gif"/>
                <Carousel.Caption style={{color:'black'}}>
                  <h3>Google Calendar</h3>
                  <p>Stay on top of your team's calendar.</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Image style={{width:'auto', height:600, margin:'0 auto'}} src="../style/images/tone.gif"/>
                <Carousel.Caption style={{color:'black'}}>
                  <h3>Tone Analyzer</h3>
                  <p>Get a quick analysis of the general tone of a channel.</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <Image style={{width:'auto', height:600, margin:'0 auto'}} src="../style/images/weather.gif"/>
                <Carousel.Caption style={{color:'black'}}>
                  <h3>Weather Forecasting</h3>
                  <p>Keep up to date with weather in your area or where you are traveling.</p>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          </div>
        </Collapse>
      </div>
    );
  }
}
