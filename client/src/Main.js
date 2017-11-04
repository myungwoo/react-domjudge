import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {translate} from 'react-i18next';

import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import {Route, Switch, Redirect} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button, IconButton, Drawer, Divider, Tooltip} from 'material-ui';
import MenuIcon from 'material-ui-icons/Menu';
import WebIcon from 'material-ui-icons/Web';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import LanguageIcon from 'material-ui-icons/Language';
import DashboardIcon from 'material-ui-icons/Dashboard';
import DescriptionIcon from 'material-ui-icons/Description';
import ListIcon from 'material-ui-icons/List';
import HighlightOffIcon from 'material-ui-icons/HighlightOff';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import TimeSync from './TimeSync';

import Auth from './storages/auth';
import Contest from './storages/contest';

import {ClockIcon} from './components/icons';
import Timer from './components/timer';
import UserInfoDialog from './components/user-info-dialog';
import ContestSelectDialog from './components/contest-select-dialog';
import LanguageSelectDialog from './components/language-select-dialog';

import Overview from './Overview';
import Problems from './Problems';
import Scoreboard from './Scoreboard';

import {availableLanguages} from './config';

const drawerWidth = 240;

const styles = theme => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
  },
  appBar: {
    position: 'fixed',
    zIndex: theme.zIndex.navDrawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    position: 'fixed',
    left: 5,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'fixed',
    height: '100%',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    width: 60,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  drawerInner: {
    // Make the items inside not wrap when transitioning:
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    width: '100%',
    overflow: 'hidden',
    paddingLeft: 60,
    paddingTop: 56,
    [theme.breakpoints.up('sm')]: {
      paddingTop: 64,
    },
  },
  contentShift: {
    paddingLeft: drawerWidth,
    transition: theme.transitions.create(['padding-left'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
});

class Main extends React.Component {
  constructor(props) {
    super(props);
    let {contest} = props;
    let now = TimeSync.getNow()/1000;
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

  componentDidUpdate() {
    if (this.state.redirect_to)
      this.setState({redirect_to: null});
  }

  tick() {
    let {contest} = this.props;
    let now = TimeSync.getNow()/1000;
    let contest_state = 0;
    if (now >= contest.endtime) contest_state = 2;
    else if (now >= contest.starttime) contest_state = 1;
    if (this.state.contest_state !== contest_state)
      this.setState({contest_state});
  }

  logout() {
    const {user, toast, t} = this.props;
    toast(t('auth.byebye', {username: user.username}));
    axios.get('./api/auth/logout', Auth.getHeader());
    Auth.doLogout();
    this.props.onLogout();
  }

  onContestChange(contest) {
    let now = TimeSync.getNow()/1000;
    let contest_state = 0;
    if (now >= contest.endtime) contest_state = 2;
    else if (now >= contest.starttime) contest_state = 1;
    this.setState({contest_state});
    this.props.onContestChange(contest);
  }

  render() {
    // Since contest list will not be changed after app load.
    // So it's able to use localStorage instead of state/props.
    let contests = Contest.getList();
    let {toast, user, contest, t, classes} = this.props;
    const languageSelection = (availableLanguages && availableLanguages.length > 1);
    return (
      <div className={classes.appFrame}>
        {this.state.redirect_to && <Redirect to={this.state.redirect_to} />}
        <AppBar className={classNames(classes.appBar, this.state.open && classes.appBarShift)}>
          <Toolbar>
            <IconButton
              color="contrast"
              aria-label="open drawer"
              onClick={() => this.setState({open: true})}
              className={classNames(classes.menuButton, this.state.open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit" style={{flex: 1}}>
            </Typography>
            <Tooltip placement="bottom" title={[t('main.time_to_start')][this.state.contest_state] || t('main.time_left')}>
              <Button dense color="contrast" onClick={() => this.setState({timer_open: !this.state.timer_open})}>
                <ClockIcon />
                {this.state.timer_open &&
                  <Timer
                    timeToGo={this.state.contest_state ? contest.endtime : contest.starttime}
                    style={{paddingLeft: 10, fontSize: 15, textTransform: 'none'}}
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
            {languageSelection && <Button dense color="contrast" onClick={() => this.setState({languages_open: true})}>
              <LanguageIcon />
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
            onContestChange={this.onContestChange.bind(this)}
            onRequestClose={() => this.setState({contests_open: false})} />}
        {languageSelection && <LanguageSelectDialog
          open={this.state.languages_open}
          onRequestClose={() => this.setState({languages_open: false})} />}
        <Drawer
          type="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
          onRequestClose={() => this.setState({open: false})}
        >
          <div className={classes.drawerInner}>
            <div className={classes.drawerHeader}>
              <IconButton onClick={() => this.setState({open: false})}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <List style={{width: 250}}>
              <ListItem button onClick={() => this.setState({redirect_to: '/'})}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary={t('main.overview')} />
              </ListItem>
              <ListItem button onClick={() => this.setState({redirect_to: '/problems'})}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary={t('main.problems')} />
              </ListItem>
              <ListItem button onClick={() => this.setState({redirect_to: '/scoreboard'})}>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary={t('main.scoreboard')} />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem button onClick={() => {this.setState({open: false}); this.logout();}}>
                <ListItemIcon>
                  <HighlightOffIcon />
                </ListItemIcon>
                <ListItemText primary={t('main.logout')} />
              </ListItem>
            </List>
          </div>
        </Drawer>
        <div className={classNames(classes.content, this.state.open && classes.contentShift)}>
          <Switch>
            <Route exact path="/" render={props =>
              (<Overview {...props} user={user} contest={contest} state={this.state.contest_state} toast={toast} />)} />
            <Route path="/problems" render={props =>
              (<Problems {...props} contest={contest} state={this.state.contest_state} toast={toast} />)} />
            <Route path="/scoreboard" render={props =>
              (<Scoreboard {...props} contest={contest} state={this.state.contest_state} toast={toast} />)} />
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

export default translate('translations')(withStyles(styles, {withTheme: true})(Main));
