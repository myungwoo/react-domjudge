import React from 'react';
import axios from 'axios';
import {Snackbar} from 'material-ui';

import Auth from './storages/auth';
import Contest from './storages/contest';

import Main from './Main';
import Login from './Login';

import Loading from './components/loading';

import './App.css';

class App extends React.Component {
  constructor(props) {
    // eslint-disable-next-line no-console
    console.log('%cDOMjudge', 'color: #3f51b5; font-weight: bold; font-size: 60pt;');
    super(props);
    this.state = {
      error: false,
      loading: true,
      user: null,
      contest: null,

      snackbar_open: false,
      snackbar_message: ''
    };
  }

  componentDidMount() {
    // Loading logic
    let user, contest;
    const validate_token = (async function(){
      if (!Auth.getUser())
        return;
      let res = await Auth.validateUser();
      this.setState({user: res});
      user = res;
    }).bind(this);
    const check_api = async function(){
      let res = (await axios.get('/api/status'));
      if (res.status !== 200 || !res.data.pong || !res.data.db_conn) throw new Error();
    };
    const get_contest = (async function(){
      await Contest.getList();
      contest = Contest.getContest();
      this.setState({contest});
    }).bind(this);
    Promise.all([validate_token(), check_api(), get_contest()])
      .then(() => {
        if (user && !contest){
          Auth.doLogout();
          this.setState({user: null});
        }
        this.setState({loading:false});
      })
      .catch(() => this.setState({error: true}));
  }

  toast(message) {
    this.setState({snackbar_open: true, snackbar_message: message});
  }

  render() {
    let content;
    if (this.state.error)
      content = (
        <div style={{textAlign: 'center', paddingTop: 100, fontWeight: 900, fontSize: 40, color: 'red', lineHeight: 2}}>
          Cannot connect to API server.<br />Please contact administrator.
        </div>
      );
    else if (this.state.loading)
      content = (
        <div style={{textAlign: 'center', paddingTop: 100, fontWeight: 900, fontSize: 40}}>
          Application is loading, please wait...
          <Loading />
        </div>
      );
    else if (this.state.user)
      content = (<Main toast={this.toast.bind(this)} onLogout={() => this.setState({user: Auth.getUser()})} user={this.state.user} contest={this.state.contest} />);
    else
      content = (<Login toast={this.toast.bind(this)} onLogin={() => this.setState({user: Auth.getUser()})} />);

    return (
      <div>
        {content}
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
