import React from 'react';
import Auth from '../auth';
import {TextField, Button} from 'material-ui';

import Loading from '../components/loading';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.toast = props.toast;
    this.state = {
      username: '',
      password: '',

      loading: false
    };
  }

  handleSubmit() {
    const message = {
      no_user: 'Sign in failed...',
      wrong_password: 'Sign in failed...',
      no_team: 'You\'re not a team member'
    };
    this.setState({loading: true});
    Auth.doLogin(this.state.username, this.state.password)
      .then(err => {
        if (err){
          this.toast(message[err] || 'Sign in failed...');
          this.setState({loading: false});
        }
        else{
          this.toast('Welcome!');
          this.props.afterLogin();
        }
      });
  }

  render() {
    return (
      <div>
        <Loading loading={this.state.loading} />
        <hgroup style={{textAlign: 'center', marginTop: '4em'}}>
          <h1 style={{fontWeight: 300, color: '#636363'}}><a href="http://domjudge.org" target="_blank" rel="noopener noreferrer">DOMJudge</a> for React</h1>
          <h3 style={{fontWeight: 300, color: '#4a89dc'}}>Powered by <a href="https://github.com/myungwoo" target="_blank" rel="noopener noreferrer">Myungwoo Chun</a></h3>
        </hgroup>
        <div style={{
          width: '380px', margin: '4em auto', padding: '3em 2em 2em 2em',
          background: '#fafafa',
          border: '1px solid #ebebeb',
          boxShadow: 'rgba(0, 0, 0, 0.14902) 0px 1px 1px 0px, rgba(0, 0, 0, 0.09804) 0px 1px 2px 0px'
        }}>
          <TextField
            placeholder="Username"
            label="Username"
            fullWidth
            style={{marginTop: 10, marginBottom: 16}}
            value={this.state.username}
            onChange={evt => this.setState({username: evt.target.value})}
            onKeyPress={e => { if (e.key === 'Enter') this.handleSubmit(); }}
          />
          <TextField
            placeholder="Password"
            label="Password"
            type="password"
            fullWidth
            style={{marginBottom: 36}}
            value={this.state.password}
            onChange={evt => this.setState({password: evt.target.value})}
            onKeyPress={e => { if (e.key === 'Enter') this.handleSubmit(); }}
          />
          <Button raised color="primary" style={{width: '100%'}} onClick={this.handleSubmit.bind(this)}>Sign In</Button>
        </div>
      </div>
    );
  }
}

export default LoginPage;
