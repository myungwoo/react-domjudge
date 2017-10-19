import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button, IconButton, Drawer, Divider, Tooltip} from 'material-ui';
import MenuIcon from 'material-ui-icons/Menu';
import WebIcon from 'material-ui-icons/Web';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import DescriptionIcon from 'material-ui-icons/Description';
import LibraryBooksIcon from 'material-ui-icons/LibraryBooks';
import HighlightOffIcon from 'material-ui-icons/HighlightOff';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import Auth from './storages/auth';

import {ClockIcon} from './components/icons';
import Timer, {getNow} from './components/timer';
import UserInfoDialog from './components/user-info-dialog';

import Overview from './Overview';

class B extends React.Component {
  componentDidMount() {
    const {toast} = this.props;
    toast('B');
  }

  render() {
    return (<h1>B</h1>);
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.toast = props.toast;
    this.onLogout = props.onLogout;
    this.user = props.user;
    this.contest = props.contest;
    let now = getNow();
    let contest_state = 0;
    if (now >= this.contest.endtime) contest_state = 2;
    else if (now >= this.contest.starttime) contest_state = 1;
    this.state = {
      open: false,
      timer_open: true,
      dialog_open: false,

      contest_state, // 0: start yet, 1: running, 2: finished
    };
  }

  componentDidMount() {
    this.timer = setInterval(this.tick.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    let now = getNow();
    let contest_state = 0;
    if (now >= this.contest.endtime) contest_state = 2;
    else if (now >= this.contest.starttime) contest_state = 1;
    if (this.state.contest_state !== contest_state)
      this.setState({contest_state});
  }

  logout() {
    Auth.doLogout(); this.onLogout();
  }

  render() {
    return (
      <div>
        <AppBar>
          <Toolbar>
            <IconButton
              color="contrast"
              aria-label="open drawer"
              onClick={() => this.setState({open: true})}
            >
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit" style={{flex: 1}}>
              DOMjudge
            </Typography>
            <Tooltip placement="bottom" title={['Time to start'][this.state.contest_state] || 'Time left'}>
              <Button dense color="contrast" onClick={() => this.setState({timer_open: !this.state.timer_open})}>
                <ClockIcon />
                {this.state.timer_open && this.state.contest_state === 0 &&
                  <Timer
                    timeToGo={this.contest.starttime}
                    style={{paddingLeft: 10, fontSize: 15}}
                  />}
                {this.state.timer_open && this.state.contest_state !== 0 &&
                  <Timer
                    timeToGo={this.contest.endtime}
                    style={{paddingLeft: 10, fontSize: 15}}
                  />}
              </Button>
            </Tooltip>
            <Button dense color="contrast" onClick={() => this.setState({dialog_open: true})}>
              <AccountCircleIcon />
            </Button>
          </Toolbar>
        </AppBar>
        <UserInfoDialog
          user={this.user}
          open={this.state.dialog_open}
          onRequestClose={() => this.setState({dialog_open: false})} />
        <Drawer open={this.state.open} onRequestClose={() => this.setState({open: false})}>
          <div>
            <List style={{width: 250}}>
              <ListItem button onClick={() => {this.setState({open: false}); window.location = '#/';}}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Overview" />
              </ListItem>
              <ListItem button onClick={() => {this.setState({open: false}); window.location = '#/B';}}>
                <ListItemIcon>
                  <LibraryBooksIcon />
                </ListItemIcon>
                <ListItemText primary="Problems" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary="Scoreboard" />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem button onClick={() => {this.setState({open: false}); this.logout();}}>
                <ListItemIcon>
                  <HighlightOffIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </div>
        </Drawer>
        <div style={{
          width: '100%', padding: '86px 10px 15px 10px'
        }}>
          <Switch>
            <Route exact path="/" render={props =>
              (<Overview {...props} user={this.user} contest={this.contest} state={this.state.contest_state} toast={this.toast.bind(this)} />)} />
            <Route exact path="/B" render={props =>
              (<B {...props} toast={this.toast.bind(this)} />)} />
            <Redirect to="/" />
          </Switch>
        </div>
      </div>
    );
  }
}

Main.PropTypes = {
  toast: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  contest: PropTypes.object.isRequired
};

export default Main;
