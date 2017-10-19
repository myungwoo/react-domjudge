import React from 'react';
import PropTypes from 'prop-types';

class WhiteBox extends React.Component {
  render() {
    const styles = {
      box: {
        width: '100%', height: '100%',
        padding: 10,
        background: '#fafafa',
        border: '1px solid #ebebeb',
        boxShadow: 'rgba(0, 0, 0, 0.14902) 0px 1px 1px 0px, rgba(0, 0, 0, 0.09804) 0px 1px 2px 0px'
      }
    };

    return (
      <div style={{...styles.box, ...this.props.style}}>
        {this.props.children}
      </div>
    );
  }
}

WhiteBox.PropTypes = {
  children: PropTypes.node.isRequired
};

export default WhiteBox;
