import React from 'react';
import PropTypes from 'prop-types';

import TimeSync from '../TimeSync';

import {pad2} from '../Helper';

class Timer extends React.PureComponent {
  state = {
    timeleft: Math.max(this.props.timeToGo - TimeSync.getNow()/1000, 0),
  };

  componentDidMount() {
    this.timer = setInterval(this.tick, 250);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick = () => {
    this.setState({timeleft: Math.max(this.props.timeToGo - TimeSync.getNow()/1000, 0)});
  }

  render() {
    let {timeToGo, ...rest} = this.props; // eslint-disable-line no-unused-vars
    const t = Math.floor(this.state.timeleft);
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
  timeToGo: PropTypes.number.isRequired,
};

export default Timer;
