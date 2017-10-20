import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button, IconButton, Drawer, Divider, Tooltip} from 'material-ui';
import MenuIcon from 'material-ui-icons/Menu';
import WebIcon from 'material-ui-icons/Web';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import DescriptionIcon from 'material-ui-icons/Description';
import LibraryBooksIcon from 'material-ui-icons/LibraryBooks';
import ListIcon from 'material-ui-icons/List';
import HighlightOffIcon from 'material-ui-icons/HighlightOff';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import Auth from './storages/auth';
import Contest from './storages/contest';

import {ClockIcon} from './components/icons';
import Timer, {getNow} from './components/timer';
import UserInfoDialog from './components/user-info-dialog';
import ContestSelectDialog from './components/contest-select-dialog';

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
    let {contest} = props;
    let now = getNow();
    let contest_state = 0;
    if (now >= contest.endtime) contest_state = 2;
    else if (now >= contest.starttime) contest_state = 1;
    this.state = {
      timer_open: true,

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
    let {contest} = this.props;
    let now = getNow();
    let contest_state = 0;
    if (now >= contest.endtime) contest_state = 2;
    else if (now >= contest.starttime) contest_state = 1;
    if (this.state.contest_state !== contest_state)
      this.setState({contest_state});
  }

  logout() {
    Auth.doLogout(); this.props.onLogout();
  }

  render() {
    // Since contest list will not be changed after app load.
    // So it's able to use localStorage instead of state/props.
    let contests = Contest.getList();
    let {toast, user, contest, onContestChange} = this.props;
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
                {this.state.timer_open &&
                  <Timer
                    timeToGo={this.state.contest_state ? contest.endtime : contest.starttime}
                    style={{paddingLeft: 10, fontSize: 15}}
                  />}
              </Button>
            </Tooltip>
            <Button dense color="contrast" onClick={() => this.setState({dialog_open: true})}>
              <AccountCircleIcon />
            </Button>
            {contests.length > 1 &&
              <Button dense color="contrast" onClick={() => this.setState({contests_open: true})}>
                <ListIcon />
              </Button>}
          </Toolbar>
        </AppBar>
        <UserInfoDialog
          user={user}
          open={this.state.dialog_open}
          onRequestClose={() => this.setState({dialog_open: false})} />
        {contests.length > 1 &&
          <ContestSelectDialog
            open={this.state.contests_open}
            contest={contest}
            onContestChange={onContestChange}
            onRequestClose={() => this.setState({contests_open: false})} />}
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
          width: '100%', padding: '86px 20px 15px 20px'
        }}>
          <Switch>
            <Route exact path="/" render={props =>
              (<Overview {...props} user={user} contest={contest} state={this.state.contest_state} toast={toast} />)} />
            <Route exact path="/B" render={props =>
              (<B {...props} toast={toast} />)} />
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
  contest: PropTypes.object.isRequired,
  onContestChange: PropTypes.func.isRequired
};

export default Main;