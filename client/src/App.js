import React from 'react';
import {Snackbar} from 'material-ui';

import Auth from './Auth';

import Main from './Main';
import Login from './Login';

import Loading from './components/loading';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      loading: true,
      user: null,

      snackbar_open: false,
      snackbar_message: ''
    };
  }

  componentDidMount() {
    if (!Auth.getUser()){
      this.setState({loading: false});
      return;
    }
    Auth.validateUser()
      .then(res => {
        this.setState({user: res, loading: false});
      })
      .catch(() => {
        this.setState({error: true});
      });
  }

  toast(message) {
    this.setState({snackbar_open: true, snackbar_message: message});
  }

  render() {
    return (
      <div>
        {this.state.error ?
          <div style={{textAlign: 'center', paddingTop: 100, fontWeight: 900, fontSize: 40, color: 'red', lineHeight: 2}}>
            Cannot connect to API server.<br /> Please contact administrator.
          </div>
          : this.state.loading ?
            <div style={{textAlign: 'center', paddingTop: 100, fontWeight: 900, fontSize: 40}}>
              Application is loading, please wait...
              <Loading />
            </div>
            : this.state.user ?
              <Main toast={this.toast.bind(this)} onLogout={() => this.setState({user: Auth.getUser()})} user={this.state.user} />
              :
              <Login toast={this.toast.bind(this)} onLogin={() => this.setState({user: Auth.getUser()})} />
        }
        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          open={this.state.snackbar_open}
          onRequestClose={() => this.setState({snackbar_open: false})}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackbar_message}</span>}
        />
      </div>
    );
  }
}

export default App;
