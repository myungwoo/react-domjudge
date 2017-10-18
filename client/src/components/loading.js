import React from 'react';

import loading from './loading.svg';

class Loading extends React.Component {
  render() {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1892)',
        width: '100%', height: '100%', zIndex: 10000,
        position: 'fixed', top: 0, left: 0,
        textAlign: 'center',
      }}>
        <div style={{
          position: 'relative', top: '50%',
          transform: 'translateY(-50%)'
        }}>
          <img src={loading} style={{width: 300, height: 300}} alt="loading" />
        </div>
      </div>
    );
  }
}

export default Loading;
