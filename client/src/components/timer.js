import React from 'react';

class Timer extends React.Component {
  componentDidMount() {
    this.timer = setInterval(this.tick, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {

  }

  render() {
    return (
      <div {...this.props}>
        00:01:39
      </div>
    );
  }
}

Timer.propTypes = {
};

export default Timer;
