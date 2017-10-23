import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';

import Auth from './storages/auth';
import {TextField, Button} from 'material-ui';

import Loading from './components/loading';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',

      loading: false
    };
  }

  handleSubmit() {
    const {toast, t} = this.props;
    const message = {
      no_user: t('auth.failed'),
      wrong_password: t('auth.failed'),
      no_team: t('auth.no_team'),
      no_contest: t('auth.no_contest')
    };
    this.setState({loading: true});
    Auth.doLogin(this.state.username, this.state.password)
      .then(err => {
        if (err){
          toast(message[err] || t('error'));
          this.setState({loading: false});
        }
        else{
          toast(t('auth.welcome', {username: this.state.username}));
          this.props.onLogin();
        }
      })
      .catch(() => toast(t('error')));
  }

  render() {
    const {t} = this.props;
    return (
      <div>
        {this.state.loading && <Loading loading={this.state.loading} />}
        <hgroup style={{textAlign: 'center', marginTop: '4em'}}>
          <h1 style={{fontWeight: 300, color: '#636363'}}><a href="http://domjudge.org" target="_blank" rel="noopener noreferrer">DOMjudge</a> for React</h1>
          <h3 style={{fontWeight: 300, color: '#4a89dc'}}>Powered by <a href="https://github.com/myungwoo" target="_blank" rel="noopener noreferrer">Myungwoo Chun</a></h3>
        </hgroup>
        <div style={{
          width: '380px', margin: '4em auto', padding: '3em 2em 2em 2em',
          background: '#fafafa',
          border: '1px solid #ebebeb',
          boxShadow: 'rgba(0, 0, 0, 0.14902) 0px 1px 1px 0px, rgba(0, 0, 0, 0.09804) 0px 1px 2px 0px'
        }}>
          <TextField
            placeholder={t('login.username')}
            label={t('login.username')}
            fullWidth
            style={{marginTop: 10, marginBottom: 16}}
            value={this.state.username}
            onChange={evt => this.setState({username: evt.target.value})}
            onKeyPress={e => { if (e.key === 'Enter') this.handleSubmit(); }}
          />
          <TextField
            placeholder={t('login.password')}
            label={t('login.password')}
            type="password"
            fullWidth
            style={{marginBottom: 36}}
            value={this.state.password}
            onChange={evt => this.setState({password: evt.target.value})}
            onKeyPress={e => { if (e.key === 'Enter') this.handleSubmit(); }}
          />
          <Button raised color="primary" style={{width: '100%'}} onClick={this.handleSubmit.bind(this)}>{t('login.sign_in')}</Button>
        </div>
      </div>
    );
  }
}

LoginPage.PropTypes = {
  toast: PropTypes.object.isRequired,
  onLogin: PropTypes.object.isRequired
};

export default translate('translations')(LoginPage);
