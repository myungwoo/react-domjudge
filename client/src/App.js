import React from 'react';
import axios from 'axios';

class App extends React.Component {
  componentDidMount() {
    axios.get('/api').then(res => {
      console.log(res);
    });
  }

  render() {
    return (
      <h1>Hello, world!</h1>
    );
  }
}

export default App;
