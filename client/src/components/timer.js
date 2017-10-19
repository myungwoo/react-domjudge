import React from 'react';
import PropTypes from 'prop-types';

const getNow = () => {
  let timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
  let now = Math.floor(timeStampInMs / 1000);
  return now;
};

class Timer extends React.Component {
  constructor(props) {
    super(props);
    let {timeToGo, ...rest} = this.props;
    this.rest = rest;
    this.timeToGo = timeToGo;
    this.state = {
      timeleft: Math.max(this.timeToGo - getNow(), 0)
    };
  }

  componentDidMount() {
    let now = getNow();
    if (this.timeToGo >= now)
      this.timer = setInterval(this.tick.bind(this), 250);
  }

  componentWillUnmount() {
    if (this.timer)
      clearInterval(this.timer);
  }

  tick() {
    this.setState({timeleft: Math.max(this.timeToGo - getNow(), 0)});
  }

  render() {
    const pad2 = (v) => v < 10 ? '0'+v : String(v);
    const t = this.state.timeleft;
    return (
      <div {...this.rest}>
        {pad2(Math.floor(t/3600))+':'+pad2(Math.floor(t/60)%60)+':'+pad2(t%60)}
      </div>
    );
  }
}

Timer.propTypes = {
  timeToGo: PropTypes.number.isRequired
};

export {Timer as default, getNow};
