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
    this.state = {
      timeleft: Math.max(this.props.timeToGo - getNow(), 0)
    };
  }

  componentDidMount() {
    this.timer = setInterval(this.tick.bind(this), 250);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    this.setState({timeleft: Math.max(this.props.timeToGo - getNow(), 0)});
  }

  render() {
    let {timeToGo, ...rest} = this.props; // eslint-disable-line no-unused-vars
    const t = this.state.timeleft;
    const pad2 = (v) => v < 10 ? '0'+v : String(v);
    const day = Math.floor(t/86400);
    let s = pad2(Math.floor(t/3600)%24)+':'+pad2(Math.floor(t/60)%60)+':'+pad2(t%60);
    if (day > 0) s = day+'d '+s;
    return (
      <div {...rest}>
        {s}
      </div>
    );
  }
}

Timer.propTypes = {
  timeToGo: PropTypes.number.isRequired
};

export {Timer as default, getNow};
